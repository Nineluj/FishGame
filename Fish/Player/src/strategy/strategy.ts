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
import { createGameNode, GameNode } from "../../../Common/src/models/tree/tree"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"

/**
 * A Strategy is a function object that returns a suggested action that
 * a player should take based on a game state.
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
            let player = getPlayerWhoseTurnItIs(gs)
            return createSkipTurnAction(player.id)
        },
    }
}

/**
 * Gets the hex coordinate right below the given point
 */
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

/**
 * Creates a strategy in which a penguin is placed in.
 * This strategy traverses the board in a pattern going left to right
 * for each row until it finds a location that isn't a hole and that isn't occupied
 * and the places a penguin there. Invokes the fallback strategy if it can't do anything
 */
const getPenguinPlacementStrategy = (fallbackStrategy: Strategy): Strategy => {
    return {
        getNextAction: (gs: GameState): Action => {
            if (gs.phase !== "penguinPlacement") {
                return fallbackStrategy.getNextAction(gs)
            }

            let player = getPlayerWhoseTurnItIs(gs)

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
 * Picks the move that has the lowest row number for the place from which the penguin is moved
 * and within this row, the lowest column number. Same process occurs on the destinations
 * if two or more moves have the same origin
 * @param moves moveActions to evaluate
 */
const tiebreakMoves = (moves: Array<Action>): Action => {
    if (moves.length === 0) {
        throw new IllegalArgumentError(
            "tiebreakMoves needs to be given at least one action"
        )
    } else if (moves.length === 1) {
        return moves[0]
    }

    let minOriginCoord = {
        x: Number.POSITIVE_INFINITY,
        y: Number.POSITIVE_INFINITY,
    }
    let minDstCoord = {
        x: Number.POSITIVE_INFINITY,
        y: Number.POSITIVE_INFINITY,
    }

    let minAction = moves[0]

    for (let m of moves) {
        if (m.data.actionType === undefined || m.data.actionType !== "move") {
            throw new IllegalArgumentError(
                "tiebreakMoves given a non-move action"
            )
        }

        /* offset are needed because of the board coordinate system
         (0,0) (2,0) (4,0)
            (1,0) (3,0)

         * The offset makes it so that the even columns are lower down.
         * The allows the points to be intepreted as
         (0,0) (2,0) (4,0)
          (1,0.5) (3,0.5)
          *  and we can then compare rows
         */
        const mOrigin = m.data.origin as Point
        const originYOffset = mOrigin.x % 2 == 0 ? 0 : 0.5
        const mDst = m.data.dst as Point
        const dstYOffset = mDst.x % 2 == 0 ? 0 : 0.5

        /* Do checks in this order:
         * origin.y
         * origin.x
         * dst.y
         * dst.x
         */
        const update =
            mOrigin.y + originYOffset < minOriginCoord.y ||
            (mOrigin.y + originYOffset === minOriginCoord.y &&
                (mOrigin.x < minOriginCoord.x ||
                    (mOrigin.x === minOriginCoord.x &&
                        (mDst.y + dstYOffset < minDstCoord.y ||
                            (mDst.y + dstYOffset === minDstCoord.y &&
                                mDst.x < minDstCoord.x)))))

        if (update) {
            minAction = m
            minOriginCoord = { x: mOrigin.x, y: mOrigin.y + originYOffset }
            minDstCoord = { x: mDst.x, y: mDst.y + dstYOffset }
        }
    }

    return minAction
}

type maximiniResult = { scoreAchieved: number; moves: Array<Action> }
const lessThan = (a: number, b: number): boolean => a < b
const greaterThan = (a: number, b: number): boolean => a > b

/**
 * Uses the minimax algorithm as described here: https://en.wikipedia.org/wiki/Minimax#Pseudocode
 * Returns the maximized score that the player with the given ID can get in `depth` turns
 * @param node state of game at which the current player is making a move
 * @param depth how many turns should the maximizingPlayer still play
 * @param maximizingPlayerId the id of the player trying to maximize their score
 */
const miniMax = (
    node: GameNode,
    depth: number,
    maximizingPlayerId: string
): maximiniResult => {
    let player = getPlayerWhoseTurnItIs(node.gs)
    const isMaximizing = player.id === maximizingPlayerId

    if (depth === -1 || node.gs.phase !== "playing") {
        return {
            scoreAchieved: node.gs.players.filter(
                (p) => p.id === maximizingPlayerId
            )[0].score,
            moves: [],
        }
    }

    const compareFunc = isMaximizing ? greaterThan : lessThan

    let best: maximiniResult = {
        scoreAchieved: isMaximizing
            ? Number.NEGATIVE_INFINITY
            : Number.POSITIVE_INFINITY,
        moves: [],
    }

    for (let future of node.children()) {
        const subCall = miniMax(
            future,
            isMaximizing ? depth - 1 : depth,
            maximizingPlayerId
        )

        if (compareFunc(subCall.scoreAchieved, best.scoreAchieved)) {
            best.scoreAchieved = subCall.scoreAchieved
            best.moves = [future.action, ...subCall.moves]
        }
    }

    return best
}

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

        const root = createGameNode(gs)
        let player = getPlayerWhoseTurnItIs(gs)

        let best = {
            actions: [createSkipTurnAction(player.id)],
            score: Number.NEGATIVE_INFINITY,
        }

        for (let future of root.children()) {
            const result = miniMax(future, stepsAhead - 2, player.id)
            const scoreAchieved = result.scoreAchieved

            if (scoreAchieved === best.score) {
                best.actions.push(future.action)
            } else if (scoreAchieved > best.score) {
                best.score = scoreAchieved
                best.actions = [future.action]
            }
        }

        // doing a skip and then a move down the line could get the same score, need
        // to eliminate that possibility
        if (best.actions.length === 1) {
            return best.actions[0]
        } else {
            // favor non-skip actions
            return tiebreakMoves(
                best.actions.filter((act) => act.data.actionType !== "skipTurn")
            )
        }
    },
})

export {
    Strategy,
    tiebreakMoves,
    getSkipTurnStrategy,
    getPenguinPlacementStrategy,
    getPenguinMaxMinMoveStrategy,
}
