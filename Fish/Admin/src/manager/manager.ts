import { PlayerInterface } from "../../../Common/player-interface"

type Competitor = {
    id: string
    age: number
    ai: PlayerInterface
}

class TournamentManager {
    private competingPlayers: Competitor[]
    private losers: Competitor[]

    constructor(players: Competitor[]) {
        this.competingPlayers = players
        this.losers = []
    }

    /**
     *
     */
    runTournament() {
        // alert the players that the tournament is beginning
        let round = 0
    }

    runRound() {}

    assignPlayersToGame() {}
}
