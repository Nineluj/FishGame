import {
    GameState,
    getPlayerWhoseTurnItIs,
} from "../../../Common/src/models/gameState"
import { Action } from "../../../Common/src/models/action"
import {
    createPlacePenguinAction,
    createSkipTurnAction,
} from "../../../Common/src/models/action/action"
import {
    Board,
    boardGet,
    getCoordinatesOfNextUnoccupiedTileToTheRight,
} from "../../../Common/src/models/board/board"
import { Point } from "../../../Common/src/models/point"
import { createGameNode } from "../../../Common/src/models/tree/tree"

/**
 * A Strategy is a function object that returns a suggested action that
 * a player should take based on a game state
 */
interface Strategy {
    /* Comes up with the next action to take */
    getNextAction: (gs: GameState) => Action
}

/**
 * Creates a strategy that makes the player skip their turn
 */
const getSkipTurnStrategy = (): Strategy => {
    return {
        getNextAction: (gs: GameState): Action => {
            let { player } = getPlayerWhoseTurnItIs(gs)
            return createSkipTurnAction(player.id)
        },
    }
}

/**
 * Creates a strategy in which a penguin is placed in.
 * This strategy traverses the board in a pattern going left to right
 * for each row until it finds a location that isn't a hole and that isn't occupied
 * and the places a penguin there. Invokes the fallback strategy if it can't do anything
 */
const getPenguinPlacementStrategy = (fallbackStrategy: Strategy): Strategy => {
    const getCoordinateBelow = (board: Board, p: Point): Point | false => {
        let newCoord: Point

        if (p.x % 2 === 0) {
            newCoord = { x: p.x + 1, y: p.y }
        } else {
            newCoord = { x: p.x - 1, y: p.y + 1 }
        }

        const v = boardGet(board, newCoord)
        return v ? newCoord : false
    }

    return {
        getNextAction: (gs: GameState): Action => {
            if (gs.phase !== "penguinPlacement") {
                return fallbackStrategy.getNextAction(gs)
            }

            let { player } = getPlayerWhoseTurnItIs(gs)

            // prettier-ignore
            for (let c: Point | false = { x: 0, y: 0 }; c; c = getCoordinateBelow(gs.board, c)) {
                let pos = getCoordinatesOfNextUnoccupiedTileToTheRight(
                    gs.board,
                    c
                )

                if (pos) {
                    return createPlacePenguinAction(player.id, pos)
                }
            }

            return fallbackStrategy.getNextAction(gs)
        },
    }
}

/**
 * Creates a strategy which minimizes the target's score the next time they
 * play their turn
 */
const getFuckOverPlayerPenguinMoveStrategy = (
    stepsAhead: number,
    targetId: string,
    fallbackStrategy: Strategy
): Strategy => ({
    getNextAction: (gs: GameState): Action => {
        if (gs.phase !== "playing") {
            return fallbackStrategy.getNextAction(gs)
        }

        let { player } = getPlayerWhoseTurnItIs(gs)
        const tree = createGameNode(gs)

        const possibleMoves = tree.children()

        return ...
    },
})

/**
 * Creates a strategy which realizes the best gain after looking ahead stepsAhead moves
 */
const getPenguinMaxMinMoveStrategy = (
    stepsAhead: number,
    fallbackStrategy: Strategy
): Strategy => ({
    getNextAction: (gs: GameState): Action => {
        if (gs.phase !== "playing") {
            return fallbackStrategy.getNextAction(gs)
        }

        let { player } = getPlayerWhoseTurnItIs(gs)

        const tree = createGameNode(gs)
        tree.children()
        return ...
    },
})
