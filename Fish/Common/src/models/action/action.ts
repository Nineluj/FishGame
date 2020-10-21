import { GameState } from "@models/gameState"
import { movePenguin, skipTurn } from "../gameState/gameState"
import { Point } from "../point"

type Action = (gs: GameState) => GameState

/**
 * Creates an action for moving a penguin in the given way
 */
export const createMoveAction = (
    playerId: string,
    origin: Point,
    dst: Point
) => (gs: GameState) => movePenguin(gs, playerId, origin, dst)

/**
 * Creates an action for skipping the current player's turn
 */
export const createSkipTurnAction = (playerId: string) => (gs: GameState) =>
    skipTurn(gs, playerId)
