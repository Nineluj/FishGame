import { GameResult, Referee } from "../referee/referee"
import { isDeepStrictEqual } from "util"
import { PlayerInterface } from "../../../Common/player-interface"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import {
    MAX_PLAYER_COUNT,
    MIN_PLAYER_COUNT,
} from "../../../Common/src/models/gameState"
import {
    callAsyncFunctionSafely,
    callFunctionSafely,
    didFail,
    didFailAsync,
} from "../utils/communications"
import { Board } from "../../../Common/src/models/board"

/**
 * A Competitor is a participant in the tournament. A Competitor contains an id, an age, and something
 * that implements the PlayerInterface.
 */
export type Competitor = {
    // the Identifier of the competitor. The name they use to enroll in the tournament
    id: string
    // the age of the player (used to determine turn order)
    age: number
    // the ai player of the competitor, knows how to play
    ai: PlayerInterface
}

/**
 * A Competitor Group represents a grouping of players for the purpose of a single game in the tournament
 */
type CompetitorGroup = Competitor[]

type ResultWithCompetitors = {
    competitors: CompetitorGroup
    results: Promise<GameResult>
}

type BoardCreateFn = () => Board

/**
 * The TournamentManager manages a single tournament. It receives competitors from a sign up server, and then
 * runs an entire tournament. The tournament manager removes competitors from ongoing game play if
 *      a) they error in any given communication between the manager and player
 *          (notification the tournament is starting, notification of victory) (or is kicked out of a game by the referee)
 *      b) the player loses an individual game
 *
 * The TournamentManager utilizes a knockout system for tournament progression, players that win the tournament move
 * to the next round
 */
export class TournamentManager {
    // These are the players that are still competing to win the tournament
    private competingPlayers: Competitor[]
    // These are competitors that lose their games
    private losers: Competitor[]
    // These are competitors that errored either in an individual game or when the tournament manager
    // communicates with them
    private failures: Competitor[]
    private boardCreateFn: undefined | BoardCreateFn

    /**
     * Construct a tournament manager for the signed up players. Must have enough players to actually run a tournament
     * @param players an array of signed up players containing ids, ages, and their corresponding ai
     * @param createBoardFn Optionally, function that can create a board that will be used for all the games in this tournament
     *      If not passed, the board creation is handled by the referee
     */
    constructor(players: Competitor[], createBoardFn?: BoardCreateFn) {
        if (players.length < MIN_PLAYER_COUNT) {
            throw new IllegalArgumentError(
                `Must have at least ${MIN_PLAYER_COUNT} players to run a tournament`
            )
        }

        this.competingPlayers = players
        this.losers = []
        this.failures = []
        this.boardCreateFn = createBoardFn
    }

    /**
     * Runs a complete tournament by splitting players into groups and getting
     * a referee to run each game. Players that score the highest score in their group
     * move on to the next round until:
     * - Two consecutive rounds return the same set of results
     * - There are not enough players to run a final game
     *
     * Returns the winners of the tournament
     */
    async runTournament(): Promise<Competitor[]> {
        await this.alertPlayersThatTournamentIsBeginning()
        this.competingPlayers = await this.runAllRounds()
        await this.alertPlayersOfVictory()
        await this.alertPlayersOfLoss()

        return this.competingPlayers
    }

    /**
     * Runs rounds until the tournament is over
     */
    async runAllRounds(): Promise<Competitor[]> {
        let remainingPlayers = this.competingPlayers
        let lastRoundWinners: Competitor[] = []

        while (this.canRunAnotherRound(remainingPlayers, lastRoundWinners)) {
            let winners = await this.runOneRound(remainingPlayers)
            lastRoundWinners = remainingPlayers
            remainingPlayers = winners
        }

        return remainingPlayers
    }

    /**
     * Determines if it is possible to run another round in this tournament. It is
     * not possible to run a new round in a tournament when there aren't enough
     * competitors to play or when two consecutive rounds have the same winners
     */
    canRunAnotherRound(
        winners: Competitor[],
        lastRoundWinners: Competitor[]
    ): boolean {
        return !(
            isDeepStrictEqual(winners, lastRoundWinners) ||
            winners.length < MIN_PLAYER_COUNT
        )
    }

    /**
     * Runs a single round of this tournament with the given competitors
     */
    async runOneRound(competitors: Competitor[]): Promise<Competitor[]> {
        const groups = TournamentManager.splitPlayersIntoGames(competitors)
        return this.runGameForEachGroup(groups)
    }

    /**
     * Tells all the active competitors that the tournament is starting. If they
     * error, make them failures
     */
    async alertPlayersThatTournamentIsBeginning() {
        await this.notifyCompetitorOrMakeFailure((competitor) =>
            competitor.ai.notifyTournamentIsStarting()
        )
    }

    /**
     * Tells the winners that they have won. If they
     * error, make them failures
     */
    async alertPlayersOfVictory() {
        await this.notifyCompetitorOrMakeFailure((competitor) =>
            competitor.ai.notifyTournamentOver(true)
        )
    }

    /**
     * Notify a player about a tournament update and make them a failures
     * if they error
     */
    private async notifyCompetitorOrMakeFailure(
        func: (comp: Competitor) => Promise<void>
    ) {
        const playersHandleVictoryGracefully: Competitor[] = []

        for (const competitor of this.competingPlayers) {
            const result = callAsyncFunctionSafely(
                async () => await func(competitor)
            )

            if (await didFailAsync(result)) {
                this.failures.push(competitor)
            } else {
                playersHandleVictoryGracefully.push(competitor)
            }
        }

        this.competingPlayers = playersHandleVictoryGracefully
    }

    /**
     * Tells all this tournament's losers that they have lost
     */
    async alertPlayersOfLoss() {
        this.losers.forEach((competitor) => {
            callAsyncFunctionSafely(
                async () => await competitor.ai.notifyTournamentOver(false)
            )
        })
    }

    /**
     * Get the IDs of all this tournament's losers
     */
    getLosers(): Array<string> {
        return getCompetitorIds(this.losers)
    }

    /**
     * Get the IDs of all this tournament's failures
     */
    getFailures(): Array<string> {
        return getCompetitorIds(this.failures)
    }

    /**
     * Runs a round in the tournament for the given game groups
     * Returns the players that are moving on to the next round
     */
    async runGameForEachGroup(
        groups: CompetitorGroup[]
    ): Promise<Competitor[]> {
        let futureResults = this.runRefereeGames(groups)
        return this.collectResults(futureResults)
    }

    /**
     * Creates a Referee for each Competitor Group, and starts the referee running the game
     */
    runRefereeGames(groups: CompetitorGroup[]): Array<ResultWithCompetitors> {
        const allResults: Array<ResultWithCompetitors> = []

        for (let playerGroup of groups) {
            const playerInterfaces = playerGroup.map(
                (competitor) => competitor.ai
            )

            const playerIds = playerGroup.map((competitor) => competitor.id)

            let board: Board | undefined = undefined
            if (this.boardCreateFn !== undefined) {
                board = this.boardCreateFn()
            }

            const ref = new Referee(playerInterfaces, board, playerIds)

            allResults.push({
                results: ref.runGamePlay(),
                competitors: playerGroup,
            })
        }

        return allResults
    }

    /**
     * Collects the competitors that have won their respective games by
     * adding losers to the loser array, and returning the winners
     *
     * @param allResults The results of all the game for this round along with the players that participated in them
     * @return the players that have won and should therefore move on in the tournament
     */
    async collectResults(
        allResults: Array<ResultWithCompetitors>
    ): Promise<Array<Competitor>> {
        let winners: Competitor[] = []

        for (let outcome of allResults) {
            const compGroup = outcome.competitors
            const gameResults = await outcome.results

            TournamentManager.addMatchingCompetitorsToArray(
                winners,
                gameResults.winners,
                compGroup
            )
            TournamentManager.addMatchingCompetitorsToArray(
                this.losers,
                gameResults.losers,
                compGroup
            )
            TournamentManager.addMatchingCompetitorsToArray(
                this.failures,
                gameResults.failures,
                compGroup
            )
        }

        return winners
    }

    /**
     * Add the matching competitors from the competitor group to the results array
     * @param compArray the array to add to
     * @param compsToAdd the ids of the competitors to add
     * @param compGroup the group of competitors to pull from
     */
    static addMatchingCompetitorsToArray(
        compArray: Competitor[],
        compsToAdd: string[],
        compGroup: CompetitorGroup
    ) {
        compsToAdd.forEach((playerId) => {
            compArray.push(
                TournamentManager.findPlayerInCompetitorGroup(
                    compGroup,
                    playerId
                )
            )
        })
    }

    /**
     * Returns the competitor with the matching ID
     */
    static findPlayerInCompetitorGroup(
        compGroup: CompetitorGroup,
        playerId: string
    ) {
        return compGroup.find((comp) => comp.id === playerId)!
    }

    /**
     * Allocates players to games by:
     * - assigning them to games with the maximal number of participants permitted in order of age
     * - if it cannot put the remaining players into maximal games, it back tracks one game, and
     *   tries games of size one less than the maximal number
     *
     * @param competitors the competitors to allocate to games
     * @return competitors grouped into games where each game's players are in sorted order by age
     */
    static splitPlayersIntoGames(competitors: Competitor[]): CompetitorGroup[] {
        let currMax = MAX_PLAYER_COUNT
        let playersToPlace = TournamentManager.sortPlayersByAge([
            ...competitors,
        ])

        let gameGroups = []

        while (playersToPlace.length > 0) {
            if (playersToPlace.length >= currMax) {
                const groupPlayers = playersToPlace.slice(0, currMax)
                gameGroups.push(groupPlayers)
                playersToPlace = playersToPlace.slice(currMax)
            } else if (
                playersToPlace.length <= MAX_PLAYER_COUNT &&
                playersToPlace.length >= MIN_PLAYER_COUNT
            ) {
                gameGroups.push(playersToPlace)
                break
            } else {
                currMax--
                if (gameGroups.length > 0) {
                    playersToPlace = gameGroups[gameGroups.length - 1].concat(
                        ...playersToPlace
                    )
                    gameGroups.pop()
                }
            }
        }
        return gameGroups
    }

    static sortPlayersByAge(playersToSort: Competitor[]) {
        return playersToSort.sort(
            (competitorA: Competitor, competitorB: Competitor) =>
                competitorA.age - competitorB.age
        )
    }
}

export const getCompetitorIds = (competitors: Array<Competitor>) =>
    competitors.map((comp) => comp.id)
