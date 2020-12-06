import { GameState } from "../models/gameState"
import { makeBoardFromTestInput, toOutputBoard } from "./boardAdapter"
import { makePlayersFromTestInput, toOutputPlayer } from "./playerAdapter"
import { createGameStateCustomBoard } from "../models/gameState/gameState"

import { ExternalState } from "./types"
import { Point } from "../models/point"

export const convertToOutputState = (gs: GameState): ExternalState => {
    return {
        board: toOutputBoard(gs.board),
        players: toOutputPlayer(gs.players),
    }
}

export const deserializeState = (externalState: ExternalState): GameState => {
    const internalPlayers = makePlayersFromTestInput(externalState.players)
    const occupiedTiles = internalPlayers.reduce(
        (acc, player) => acc.concat(player.penguins),
        [] as Point[]
    )

    const board = makeBoardFromTestInput(externalState.board, occupiedTiles)
    return createGameStateCustomBoard(internalPlayers, board)
}
