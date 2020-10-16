import { Tile, Hole } from "@/models/tile"
import { Board } from "@/models/board"
import { GameState } from "@/models/gameState/gameState"
import update from "immutability-helper"

export interface ViewTile extends Tile {
    penguinColor?: string
}

export type ViewBoard = Array<Array<ViewTile | Hole>>

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
