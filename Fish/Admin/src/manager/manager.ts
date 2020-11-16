import { Referee } from "src/referee/referee"
import { PlayerInterface } from "../../../Common/player-interface"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import {
    MAX_PLAYER_COUNT,
    MIN_PLAYER_COUNT,
} from "../../../Common/src/models/gameState"

export type Competitor = {
    id: string
    age: number
    ai: PlayerInterface
}

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
     *
     */
    runTournament() {
        // alert the players that the tournament is beginning
        // runs each round

        //while (i have enough players to keep going)
        // splitPlayersIntoGames() -> Competitor[][] -> pool competitors into game groups
        // runRound() -> for each competitor group run a refereed game - keep track results
        // check if the results of run round are the same as the last time it ran
        //

        let round = 0
    }

    /**
     *
     */
    alertPlayersThatTournamentIsBeginning() {}

    // call player function safely

    runRound() {}

    /**
     * Split the remaining competitors into
     * //TODO describe in more detail
     */
    static splitPlayersIntoGames(competitors: Competitor[]) {
        let currMax = MAX_PLAYER_COUNT
        let playersToPlace = [...competitors]
        let gameResult = []

        while (playersToPlace.length > 0) {
            if (
                playersToPlace.length >= currMax &&
                currMax >= MIN_PLAYER_COUNT
            ) {
                const groupPlayers = playersToPlace.slice(0, currMax)
                gameResult.push(
                    TournamentManager.sortPlayersByAge(groupPlayers)
                )
                playersToPlace = playersToPlace.slice(currMax)
            } else if (
                playersToPlace.length <= MAX_PLAYER_COUNT &&
                playersToPlace.length > currMax
            ) {
                gameResult.push(
                    TournamentManager.sortPlayersByAge(playersToPlace)
                )
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
