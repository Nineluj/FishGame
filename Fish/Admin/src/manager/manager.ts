import { Referee } from "src/referee/referee"
import { isDeepStrictEqual } from "util"
import { PlayerInterface } from "../../../Common/player-interface"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import {
    MAX_PLAYER_COUNT,
    MIN_PLAYER_COUNT,
} from "../../../Common/src/models/gameState"
import { callFunctionSafely } from "../../src/utils/communications"

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

/**
 * The TournamentManager manages a single tournament. It receives competitors from a sign up server, and then
 * runs an entire tournament. The tournament manager removes competitors from ongoing game play if
 *      a) they error in any given communication between the manager and player
 *          (notification the tournament is starting, notification of victory) (or is kicked out of a game by the referee)
 *      b) the player loses an individual game
 * Currently, we do not manage players that take too long to respond. // TODO: This will be managed by the Communication Layer (see remote.md)
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

    /**
     * Construct a tournament manager for the signed up players. Must have enough players to actually run a tournament
     * @param players an array of signed up players containing ids, ages, and their corresponding ai
     */
    constructor(players: Competitor[]) {
        if (players.length < MIN_PLAYER_COUNT) {
            throw new IllegalArgumentError(
                `Must have at least ${MIN_PLAYER_COUNT} players to run a tournament`
            )
        }

        this.competingPlayers = players
        this.losers = []
        this.failures = []
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
    runTournament(): Competitor[] {
        this.alertPlayersThatTournamentIsBeginning()
        this.competingPlayers = this.runAllRounds()
        this.alertPlayersOfVictory()
        this.alertPlayersOfLoss()

        return this.competingPlayers
    }

    /**
     * Runs rounds until the tournament is over
     */
    runAllRounds(): Competitor[] {
        let remainingPlayers = this.competingPlayers
        let lastRoundWinners: Competitor[] = []

        while (this.canRunAnotherRound(remainingPlayers, lastRoundWinners)) {
            let winners = this.runOneRound(remainingPlayers)
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
    runOneRound(competitors: Competitor[]): Competitor[] {
        const groups = TournamentManager.splitPlayersIntoGames(competitors)
        const winners = this.runGameForEachGroup(groups)

        return winners
    }

    /**
     * Tells all the active competitors that the tournament is starting. If they
     * error, make them failures
     */
    alertPlayersThatTournamentIsBeginning() {
        this.notifyCompetitorOrMakeFailure((competitor) =>
            competitor.ai.notifyTournamentIsStarting()
        )
    }

    /**
     * Tells the winners that they have won. If they
     * error, make them failures
     */
    alertPlayersOfVictory() {
        this.notifyCompetitorOrMakeFailure((competitor) =>
            competitor.ai.notifyTournamentOver(true)
        )
    }

    /**
     * Notify a player about a tournament update and make them a failures
     * if they error
     */
    private notifyCompetitorOrMakeFailure(func: (comp: Competitor) => void) {
        const playersHandleVictoryGracefully: Competitor[] = []

        this.competingPlayers.forEach((competitor) => {
            const result = callFunctionSafely(() => func(competitor))

            if (result === false) {
                this.failures.push(competitor)
            } else {
                playersHandleVictoryGracefully.push(competitor)
            }
        })

        this.competingPlayers = playersHandleVictoryGracefully
    }

    /**
     * Tells all this tournament's losers that they have lost
     */
    alertPlayersOfLoss() {
        this.losers.forEach((competitor) => {
            callFunctionSafely(() => competitor.ai.notifyTournamentOver(false))
        })
    }

    /**
     * Get the IDs of all this tournament's losers
     */
    getLosers(): Array<string> {
        return this.losers.map((competitor) => competitor.id)
    }

    /**
     * Get the IDs of all this tournament's failures
     */
    getFailures(): Array<string> {
        return this.failures.map((competitor) => competitor.id)
    }

    /**
     * Runs a round in the tournament for the given game groups
     * Returns the players that are moving on to the next round
     */
    runGameForEachGroup(groups: CompetitorGroup[]): Competitor[] {
        let refCompGroups = this.runRefereeGames(groups)
        let winners = this.collectResults(refCompGroups)

        return winners
    }

    /**
     * Creates a Referee for each Competitor Group, and starts the referee running the game
     *
     * *Note: This is not currently asynchronous, but this was split to better allow that in the future
     *
     * Returns the pair of referee with the group of players of their game.
     */
    runRefereeGames(
        groups: CompetitorGroup[]
    ): Array<[Referee, CompetitorGroup]> {
        const allRefs: [Referee, CompetitorGroup][] = []

        for (let playerGroup of groups) {
            const playerInterfaces = playerGroup.map(
                (competitor) => competitor.ai
            )

            const playerIds = playerGroup.map((competitor) => competitor.id)

            const ref = new Referee(playerInterfaces, undefined, playerIds)
            ref.runGamePlay()

            allRefs.push([ref, playerGroup])
        }

        return allRefs
    }

    /**
     * Collects the competitors that have won their respective games by
     * adding losers to the loser array, and returning the winners
     *
     * Note: This is not currently asynchronous, but this was split to better allow that in the future
     *
     * @param allRefs An Array of Pairs of referees and the players in the referee's game
     * @return the players that have won and should therefore move on in the tournament
     */
    collectResults(
        allRefs: Array<[Referee, CompetitorGroup]>
    ): Array<Competitor> {
        let winners: Competitor[] = []

        for (let outcome of allRefs) {
            let [ref, compGroup] = outcome

            const gameResults = ref.getPlayerResults()

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
