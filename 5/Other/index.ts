import { parseJsonObjectsFromStdIn } from "../../Fish/Common/src/adapters/parseJson"
import { makePlayersFromTestInput } from "../../Fish/Common/src/adapters/playerAdapter"
import {
    GameState,
    getPlayerWhoseTurnItIs,
} from "../../Fish/Common/src/models/gameState"

import { Point, containsPoint } from "../../Fish/Common/src/models/point"
import {
    makeBoardFromTestInput,
    convertToBoardLocation,
    convertToOutputLocation,
} from "../../Fish/Common/src/adapters/boardAdapter"
import { getReachableTilesFrom } from "../../Fish/Common/src/models/board"
import {
    createMoveAction,
    Action,
} from "../../Fish/Common/src/models/action/action"
import { tiebreakMoves } from "../../Fish/Player/src/strategy/strategy"
import { pointsEqual } from "../../Fish/Common/src/models/point/point"
import { movePenguin } from "../../Fish/Common/src/models/gameState/gameState"
import { createGameNode } from "../../Fish/Common/src/models/tree/tree"

interface Player {
    color: "red" | "white" | "brown" | "black"
    score: number
    places: Array<[number, number]>
}

interface ExternalState {
    players: Array<Player>
    board: Array<Array<number>>
}

interface MoveResponseQuery {
    state: ExternalState
    from: [number, number]
    to: [number, number]
}

type Output = false | [[number, number], [number, number]]

const getNeighboringPoints = (point: Point): Array<Point> => {
    const directions = [
        // north
        { odd: { x: 0, y: -1 }, even: { x: 0, y: -1 } },
        // northeast
        { odd: { x: 1, y: 0 }, even: { x: 1, y: -1 } },
        // southeast
        { odd: { x: 1, y: 1 }, even: { x: 1, y: 0 } },
        // south
        { odd: { x: 0, y: 1 }, even: { x: 0, y: 1 } },
        // southwest
        { odd: { x: -1, y: 1 }, even: { x: -1, y: 0 } },
        // is actually northewest
        { odd: { x: -1, y: 0 }, even: { x: -1, y: -1 } },
    ]
    // { odd: { x: 0, y: -1 }, even: { x: 0, y: -1 } },
    // { odd: { x: 1, y: 0 }, even: { x: 1, y: -1 } },
    // { odd: { x: 1, y: 1 }, even: { x: 1, y: 0 } },
    // { odd: { x: 0, y: 1 }, even: { x: 0, y: 1 } },
    // { odd: { x: -1, y: 1 }, even: { x: -1, y: 0 } },
    // { odd: { x: -1, y: 0 }, even: { x: -1, y: -1 } },
    const output: Array<Point> = []

    const whichDir = point.x % 2 == 0 ? "even" : "odd"

    directions.forEach((direction) => {
        output.push({
            x: point.x + direction[whichDir].x,
            y: point.y + direction[whichDir].y,
        })
    })

    return output
}

const findSuitableMove = (
    gs: GameState,
    targetLocation: Point
): false | Action => {
    const neighbors = getNeighboringPoints(targetLocation)
    const tree = createGameNode(gs)
    const potentialMoves = tree.children()

    let output: boolean | Action = false
    neighbors.forEach((neighbor) => {
        const out: Array<Action> = []
        potentialMoves.forEach((potentialMove) => {
            if (
                potentialMove.action.data.dst &&
                pointsEqual(potentialMove.action.data.dst, neighbor)
            ) {
                out.push(potentialMove.action)
            }
        })
        if (!output && out.length > 0) {
            output = tiebreakMoves(out)
        }
    })

    return output
}

const runTestCase = (input: MoveResponseQuery): Output => {
    // return false;

    const players = makePlayersFromTestInput(input.state.players)

    let occupiedTiles = []
    for (const pl of players) {
        for (const peng of pl.penguins) {
            occupiedTiles.push(peng)
        }
    }

    const board = makeBoardFromTestInput(input.state.board, occupiedTiles)

    const gs: GameState = {
        board,
        players,
    }

    const newGs = movePenguin(
        gs,
        players[0].id,
        convertToBoardLocation(...input.from),
        convertToBoardLocation(...input.to)
    )

    const result = findSuitableMove(newGs, convertToBoardLocation(...input.to))

    if (result) {
        return [
            convertToOutputLocation(result.data.origin.x, result.data.origin.y),
            convertToOutputLocation(result.data.dst.x, result.data.dst.y),
        ]
    }

    return false
}

const main = () => {
    parseJsonObjectsFromStdIn((data: Array<any>) => {
        const output = runTestCase(data[0])

        console.log(output)
    })
}

main()
