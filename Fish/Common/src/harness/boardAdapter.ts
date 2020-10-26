import { Board, boardSet } from "../models/board"
import { Point, containsPoint } from "../models/point"

const isEven = (num: number): boolean => {
    return num % 2 === 0
}

/**
 * Given a datapoint using a coordinate system as below, convert it to the
 * odd-q coordinate system described here: https://www.redblobgames.com/grids/hexagons/#coordinates-offset
 *      INPUT COORDINATES                   OUTPUT COORDINATES
 *  (0,0)  (0,1)  (0,2)  (0,3)          (0,0)  (2,0)  (4,0)  (6,0)
 *     (1,0)  (1,1)  (1,2)                 (1,0)  (3,0)  (5,0)
 *  (2,0)  (2,1)  (2,2)  (2,3)          (0,1)  (2,1)  (4,1)  (6,1)
 *     (3,0)  (3,1)  (3,2)                 (1,1)  (3,1)  (5,1)
 *
 * @param y0 the X coordinate of the position in the original coordinate system
 * @param x0 the Y coordinate of the position in the original coordinate system
 */
export const convertToBoardLocation = (y0: number, x0: number): Point => {
    const y1 = Math.floor(y0 / 2)
    let x1
    if (isEven(y0)) {
        x1 = x0 * 2
    } else {
        x1 = x0 * 2 + 1
    }

    return { x: x1, y: y1 }
}

/**
 * Converts the given position from the internal representation to a
 * position in the external representation
 */
export const convertToOutputLocation = (
    y0: number,
    x0: number
): [number, number] => {
    const newPos = convertToBoardLocation(y0, x0)
    return [newPos.x, newPos.y]
}

/**
 * Given a 2d array of coordinates using a coordinate system as below, convert it to the
 * odd-q coordinate system described here: https://www.redblobgames.com/grids/hexagons/#coordinates-offset
 * @param boardData a 2d array of numbers, where 0 means the coordinates is a hole
 * and any positive number is the number of fish on the tile
 */
export const makeBoardFromTestInput = (
    boardData: Array<Array<number>>,
    occupiedTiles: Array<Point>
): Board => {
    let board: Board = [[]]

    for (let i = 0; i < boardData.length; i++) {
        const row = boardData[i]
        for (let j = 0; j < row.length; j++) {
            const numFish = row[j]
            const newCoordinates = convertToBoardLocation(i, j)
            const tile =
                numFish === 0
                    ? "hole"
                    : {
                          fish: numFish,
                          occupied: containsPoint(
                              occupiedTiles,
                              newCoordinates
                          ),
                      }

            board = boardSet(board, newCoordinates, tile)
        }
    }

    return board
}

export const toOutputBoard = (board: Board): Array<Array<number>> => {
    let output: Array<Array<number>> = [[]]
    for (let i = 0; i < board.length; i++) {
        const row = board[i]
        for (let j = 0; j < row.length; j++) {
            const tile = row[j]
            let numFish = 0

            if (tile !== "hole") {
                numFish = tile.fish
            }

            const newCoordinates = convertToOutputLocation(i, j)

            if (output[newCoordinates[0]] === undefined) {
                output[newCoordinates[0]] = []
            }

            output[newCoordinates[0]][newCoordinates[1]] = numFish
        }
    }
    return output
}
