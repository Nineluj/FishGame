import { GameState } from "../models/gameState"
import { makeBoardFromTestInput, toOutputBoard } from "./boardAdapter"
import { makePlayersFromTestInput, toOutputPlayer } from "./playerAdapter"
import { createGameStateCustomBoard } from "src/models/gameState/gameState"

import { ExternalState } from "./types"

export const convertToOutputState = (gs: GameState): ExternalState => {
    return {
        board: toOutputBoard(gs.board),
        players: toOutputPlayer(gs.players),
    }
}

export const deserializeState = (externalState: ExternalState): GameState => {
    const internalPlayers = makePlayersFromTestInput(externalState.players)
    const board = makeBoardFromTestInput(externalState.board, [])
    return createGameStateCustomBoard(internalPlayers, board)
}
