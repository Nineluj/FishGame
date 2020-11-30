import { GameState } from "../models/gameState"
import { ExternalState } from "../../../Remote/src/common/types"
import { toOutputBoard } from "./boardAdapter"
import { toOutputPlayer } from "./playerAdapter"

export const convertToOutputState = (gs: GameState): ExternalState => {
    return {
        board: toOutputBoard(gs.board),
        players: toOutputPlayer(gs.players),
    }
}
