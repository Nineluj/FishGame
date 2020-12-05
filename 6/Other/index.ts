import { parseJsonObjectsFromStdIn } from "../../Fish/Common/src/adapters/parseJson"
import { makePlayersFromTestInput } from "../../Fish/Common/src/adapters/playerAdapter"
import { GameState } from "../../Fish/Common/src/models/gameState"

import {
    makeBoardFromTestInput,
    convertToOutputLocation,
} from "../../Fish/Common/src/adapters/boardAdapter"
import {
    getPenguinMaxMinMoveStrategy,
    getSkipTurnStrategy,
} from "../../Fish/Player/src/strategy/strategy"

interface Player {
    color: "red" | "white" | "brown" | "black"
    score: number
    places: Array<[number, number]>
}

interface ExternalState {
    players: Array<Player>
    board: Array<Array<number>>
}

type DepthState = [number, ExternalState]

type Output = false | [[number, number], [number, number]]

/**
 *
 */
const runTestCase = (input: DepthState): Output => {
    const externalState = input[1]
    const depth = input[0]

    const players = makePlayersFromTestInput(externalState.players)

    let occupiedTiles = []
    for (const pl of players) {
        for (const peng of pl.penguins) {
            occupiedTiles.push(peng)
        }
    }

    const board = makeBoardFromTestInput(externalState.board, occupiedTiles)

    const gs: GameState = {
        board,
        players,
        phase: "playing",
    }

    const strat = getPenguinMaxMinMoveStrategy(depth, getSkipTurnStrategy())
    const responseAction = strat.getNextAction(gs)

    if (responseAction.actionType === "skip") {
        return false
    }

    const origin = responseAction.data.origin
    const dst = responseAction.data.dst

    return [
        convertToOutputLocation(origin.x, origin.y),
        convertToOutputLocation(dst.x, dst.y),
    ]
}

const main = () => {
    parseJsonObjectsFromStdIn((data: Array<any>) => {
        const output = runTestCase(data[0])
        console.log(JSON.stringify(output))
    })
}

main()
