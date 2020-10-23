import { makeBoardFromTestInput, toOutputBoard } from "./boardAdapter"
import { parseJsonObjectsFromStdIn } from "./parseJson"
import { makePlayersFromTestInput, toOutputPlayer } from "./playerAdapter"
import {
    GameState,
    movePenguin,
} from "../../Fish/Common/src/models/gameState/gameState"

export interface Player {
    color: "red" | "white" | "brown" | "black"
    score: number
    places: Array<[number, number]>
}

interface TestData {
    players: Array<Player>
    board: Array<Array<number>>
}

const findSuitableMove = (gs: GameState): GameState | false => {
    const players = gs.players
    // using the color as playerId since that's what makePlayersFromTestInput uses
    const origin = players[0].penguins[0]
    const directions = [
        // north
        { odd: { x: 0, y: 1 }, even: { x: 0, y: 1 } },
        // northeast
        { odd: { x: 1, y: 0 }, even: { x: 1, y: -1 } },
        // southeast
        { odd: { x: 1, y: 1 }, even: { x: 1, y: 0 } },
        // south
        { odd: { x: 0, y: -1 }, even: { x: 0, y: -1 } },
        // southwest
        { odd: { x: -1, y: 1 }, even: { x: -1, y: 0 } },
        // northwest
        { odd: { x: -1, y: 0 }, even: { x: -1, y: -1 } },
    ]

    const whichDir = origin.x % 2 == 0 ? "even" : "odd"

    for (const dir of directions) {
        try {
            const result = movePenguin(gs, players[0].penguinColor, origin, {
                x: origin.x + dir[whichDir].x,
                y: origin.y + dir[whichDir].y,
            })
            return result
        } catch {}
    }

    return false
}

const runTest = (input: TestData) => {
    const players = makePlayersFromTestInput(input.players)

    let occupiedTiles = []
    for (const pl of players) {
        for (const peng of pl.penguins) {
            occupiedTiles.push(peng)
        }
    }

    const board = makeBoardFromTestInput(input.board, occupiedTiles)

    const gs: GameState = {
        board,
        players,
        phase: "playing",
        turn: 0,
    }

    const result = findSuitableMove(gs)
    const print = (data: any) => console.log(JSON.stringify(data, null, 2))

    if (result === false) {
        print(false)
    } else {
        print({
            board: toOutputBoard(result.board),
            players: toOutputPlayer(result.players),
        })
    }
}

/**
 * Parses a JSON object from STDIN, runs it as a single test case, and prints out the
 * result to STDOUT
 */
const main = () => {
    // parse objects from stdin, invoke runTest on first json object when stdin stream ends
    parseJsonObjectsFromStdIn((data) => {
        runTest(data[0])
    })
}

main()
