// ExternalPlayer is the external representation of a player, as given by the test input files
import { Player as ExternalPlayer } from "./index"
// InternalPlayer is the representation of the player by our project
import { Player as InternalPlayer } from "../../Fish/Common/src/models/player"
import { convertToBoardLocation, convertToOutputLocation } from "./boardAdapter"

export const makePlayersFromTestInput = (
    players: Array<ExternalPlayer>
): Array<InternalPlayer> => players.map((p, index) => makePlayer(p, index))

const makePlayer = (p: ExternalPlayer, age: number): InternalPlayer => {
    return {
        age: age,
        id: `${p.color}`,
        penguinColor: p.color,
        penguins: p.places.map((pos) => convertToBoardLocation(...pos)),
        score: p.score,
    }
}

export const toOutputPlayer = (
    players: Array<InternalPlayer>
): Array<ExternalPlayer> =>
    players.map((p) => ({
        color: p.penguinColor,
        score: p.score,
        places: p.penguins.map((pos) => convertToOutputLocation(pos.x, pos.y)),
    }))
