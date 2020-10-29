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
import {
    applyToAllFutureStates,
    completeAction,
    createGameNode,
} from "../../../Common/src/models/tree/tree"

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
    targetId: string,
    fallbackStrategy: Strategy
): Strategy => ({
    getNextAction: (gs: GameState): Action => {
        if (gs.phase !== "playing") {
            return fallbackStrategy.getNextAction(gs)
        }

        throw new Error("not implemented")
    },
})

/**
 * Picks the move that has the lowest row number for the place from which the penguin is moved
 * and within this row, the lowest column number. Same process occurs on the destinations
 * if two or more moves have the same origin
 * @param moves moveActions to evaluate
 */
const tiebreakMoves = (moves: Array<Action>): Action => {
    // TODO: finish this
    let best = {}

    for (let m of moves) {
        if (m.data.actionType !== undefined && m.data.actionType === "move") {
        }
    }

    throw new Error("not implemented")
}

/**
 * Gets the
 */
const getBestMovesOneTurn = (gn: GameNode): Array<Action> => {
    //    applyToAllFutureStates(gn, (gs: GameState) => {})

    throw new Error("not implemented")
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

        let { player } = getPlayerWhoseTurnItIs(gs)

        const tree = createGameNode(gs)
        if (stepsAhead === 0) {
            // pick the one that gets the most point in one move
            return tiebreakMoves(getBestMovesOneTurn(tree))
        }

        /* assess and collect the best possible moves that the player can make */
        const possibleFutures = tree.children()

        let best = {
            // score that can be achieved in that subtree
            scoreAchieved: player.score,
            // initial action taken to get into that subtree
            // (multiple if they have the same max score)
            actions: [createSkipTurnAction(player.id)],
        }

        for (let future of possibleFutures) {
            let node = future

            for (let i = 0; i < stepsAhead * gs.players.length; i++) {
                // TODO: -1?
                let newAction

                if (getPlayerWhoseTurnItIs(node.gs).player.id === player.id) {
                    newAction = getPenguinMaxMinMoveStrategy(
                        stepsAhead - 1,
                        getSkipTurnStrategy()
                    )
                } else {
                    newAction = getFuckOverPlayerPenguinMoveStrategy(
                        player.id,
                        getSkipTurnStrategy()
                    )
                }

                node = completeAction(node, newAction.getNextAction(node.gs))
            }

            // find the score
            let score = 0 // TODO

            // compare the score against the other possibilities
            if (score === best.scoreAchieved) {
                best.actions.push(future.action)
            } else if (score > best.scoreAchieved) {
                best.scoreAchieved = score
                best.actions = [future.action]
            }
        }

        if (best.actions.length === 1) {
            return best.actions[0]
        }

        // tie breaker
        return tiebreakMoves(best.actions)
    },
})
