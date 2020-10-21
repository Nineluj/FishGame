import { GameState } from "@models/gameState"

export interface Action {
    apply: (gs: GameState) => GameState
}
