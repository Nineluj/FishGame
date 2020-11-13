import { Tile, Hole } from "../../../Common/src/models/tile"
import { Board } from "../../../Common/src/models/board"
import { GameState } from "../../../Common/src/models/gameState/gameState"
import update from "immutability-helper"

export interface ViewTile extends Tile {
    penguinColor?: string
}

export type ViewBoard = Array<Array<ViewTile | Hole>>

/**
 * Converts the gameState board into a representation that is easy for the
 * view to render.
 */
export const getViewBoard = (gameState: GameState): ViewBoard => {
    let output = gameState.board
    gameState.players.forEach((player) => {
        player.penguins.forEach((penguin) => {
            const { x, y } = penguin
            const newTile = {
                ...(gameState.board[x][y] as Tile),
                penguinColor: player.penguinColor,
            }
            output = update(output, {
                [x]: {
                    [y]: {
                        $set: newTile,
                    },
                },
            })
        })
    })

    console.log(output)

    return output
}
