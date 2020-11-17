import { Referee } from "src/referee/referee"
import { isDeepStrictEqual } from "util"
import { PlayerInterface } from "../../../Common/player-interface"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import {
    MAX_PLAYER_COUNT,
    MIN_PLAYER_COUNT,
} from "../../../Common/src/models/gameState"
import { callFunctionSafely } from "src/utils/communications"

export type Competitor = {
    id: string
    age: number
    ai: PlayerInterface
}

type CompetitorGroup = Competitor[]

export class TournamentManager {
    private competingPlayers: Competitor[]
    private losers: Competitor[]

    constructor(players: Competitor[]) {
        if (players.length < MIN_PLAYER_COUNT) {
            throw new IllegalArgumentError(
                `Must have at least ${MIN_PLAYER_COUNT} players to run a tournament`
            )
        }

        this.competingPlayers = players
        this.losers = []
    }

    /**
     * Runs a complete tournament by splitting players into groups and getting
     * a referee to run each game. Players that score the highest score in their group
     * move on to the next round until:
     * - The same round results happen twice
     * - There are not enough players to run a final game
     *
     * Returns the winners of the tournament
     */
    runTournament(): Competitor[] {
        this.alertPlayersThatTournamentIsBeginning()

        let remainingPlayers = this.competingPlayers
        let lastRoundWinners: Competitor[] = []

        while (this.canRunAnotherRound(remainingPlayers, lastRoundWinners)) {
            let winners = this.runOneRound(remainingPlayers)
            lastRoundWinners = remainingPlayers
            remainingPlayers = winners
        }

        this.competingPlayers = remainingPlayers

        // notify all the players that won
        this.alertPlayersOfVictory()

        // notify all the players that lost
        this.alertPlayersOfLoss()

        return this.competingPlayers
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
        if (isDeepStrictEqual(winners, lastRoundWinners)) {
            return false
        }

        if (winners.length < MIN_PLAYER_COUNT) {
            return false
        }

        return true
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
     * error, make them losers
     */
    alertPlayersThatTournamentIsBeginning() {
        this.notifyCompetitorOrMakeLoser((competitor) =>
            competitor.ai.notifyTournamentIsStarting()
        )
    }

    /**
     * Tells the winners that they have won. If they
     * error, make them losers
     */
    alertPlayersOfVictory() {
        this.notifyCompetitorOrMakeLoser((competitor) =>
            competitor.ai.notifyTournamentOver(true)
        )
    }

    /**
     * Notify a player about a tournament update and make them a loser
     * if they error
     */
    private notifyCompetitorOrMakeLoser(func: (comp: Competitor) => void) {
        const playersHandleVictoryGracefully: Competitor[] = []

        this.competingPlayers.forEach((competitor) => {
            const result = callFunctionSafely(() => func(competitor))

            if (result === false) {
                this.losers.push(competitor)
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
     * Runs a round in the tournament
     * Returns the players that are moving on to the next round
     */
    runGameForEachGroup(groups: CompetitorGroup[]): Competitor[] {
        let refCompGroups = this.runRefereeGames(groups)
        let winners = this.collectResults(refCompGroups)

        return winners
    }

    /**
     * TODO: more better comment
     * Sets up and runs a referee game for each group
     * Returns the connection of referee with their corresponding groups
     */
    runRefereeGames(
        groups: CompetitorGroup[]
    ): Array<[Referee, CompetitorGroup]> {
        const allRefs: [Referee, CompetitorGroup][] = []

        for (let playerGroup of groups) {
            // these are already sorted
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
     * Collects the competitors that have won their respective games
     */
    collectResults(
        allRefs: Array<[Referee, CompetitorGroup]>
    ): Array<Competitor> {
        let winners: Competitor[] = []

        for (let outcome of allRefs) {
            let [ref, compGroup] = outcome

            const gameResults = ref.getPlayerResults()

            gameResults.winners.forEach((playerId) => {
                winners.push(
                    TournamentManager.findPlayerInCompetitorGroup(
                        compGroup,
                        playerId
                    )
                )
            })

            gameResults.losers.forEach((playerId) => {
                this.losers.push(
                    TournamentManager.findPlayerInCompetitorGroup(
                        compGroup,
                        playerId
                    )
                )
            })
        }

        return winners
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
     * Split the remaining competitors into
     * //TODO describe in more detail
     */
    static splitPlayersIntoGames(competitors: Competitor[]) {
        let currMax = MAX_PLAYER_COUNT
        let playersToPlace = TournamentManager.sortPlayersByAge([
            ...competitors,
        ])
        let gameResult = []

        while (playersToPlace.length > 0) {
            if (
                playersToPlace.length >= currMax &&
                currMax >= MIN_PLAYER_COUNT
            ) {
                const groupPlayers = playersToPlace.slice(0, currMax)
                gameResult.push(groupPlayers)
                playersToPlace = playersToPlace.slice(currMax)
            } else if (
                playersToPlace.length <= MAX_PLAYER_COUNT &&
                playersToPlace.length > currMax
            ) {
                gameResult.push(playersToPlace)
                break
            } else {
                currMax--
                if (gameResult.length > 0) {
                    playersToPlace = gameResult[gameResult.length - 1].concat(
                        ...playersToPlace
                    )
                    gameResult.pop()
                }
            }
        }
        return gameResult
    }

    static sortPlayersByAge(playersToSort: Competitor[]) {
        return playersToSort.sort(
            (competitorA: Competitor, competitorB: Competitor) =>
                competitorA.age - competitorB.age
        )
    }
}
