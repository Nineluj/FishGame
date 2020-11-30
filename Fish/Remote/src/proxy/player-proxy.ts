import { Connection } from "../common/connection"
import { PlayerInterface } from "../../../Common/player-interface"
import { Action } from "../../../Common/src/models/action"
import {
    GameState,
    getPlayerWhoseTurnItIs,
} from "../../../Common/src/models/gameState"
import {
    EndMessage,
    ExternalAction,
    externalActionFromAny,
    externalPositionFromAny,
    Message,
    PlayingAsMessage,
    PlayingWithMessage,
    SetupMessage,
    StartMessage,
    TakeTurnMessage,
} from "../common/types"
import { IllegalResponseError } from "../../../Common/src/models/errors/illegalResponseError"
import { PenguinColor } from "../../../Common/src/models/player"
import { convertToOutputState } from "../../../Common/src/harness/stateAdapter"
import {
    createMoveAction,
    createPlacePenguinAction,
    createSkipTurnAction,
} from "../../../Common/src/models/action/action"
import {
    convertToBoardLocation,
    convertToOutputLocation,
} from "../../../Common/src/harness/boardAdapter"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import { Point } from "../../../Common/src/models/point"
const deasync = require("deasync")

class PlayerProxy implements PlayerInterface {
    private connection: Connection
    private playerEliminatedSinceLastCall: boolean
    private actionHistory: Array<ExternalAction>

    constructor(connection: Connection) {
        this.connection = connection
        this.playerEliminatedSinceLastCall = false
        this.actionHistory = []
    }

    // TODO: test this
    private static deasync<T>(p: Promise<T>): T {
        let done = false
        let data: T
        let err

        p.then((out) => {
            data = out
            done = true
        }).catch((promiseErr) => {
            err = promiseErr
            done = true
        })

        deasync.loopWhile(() => !done)

        if (err) {
            throw new IllegalResponseError(err)
        }

        return data!
    }

    private sendAndReceive(msg: Message) {
        return PlayerProxy.deasync(this.connection.send(msg))
    }

    /**
     * Sends the given message, reads the result and asserts
     * that it is equal to the string void
     */
    private sendAndAssertVoid(msg: Message) {
        const result = this.sendAndReceive(msg)
        PlayerProxy.assertVoid(result)
    }

    /**
     * Throws an error if the given value is not the string void
     * @private
     */
    private static assertVoid(val: any) {
        if (val !== "void") {
            throw new IllegalResponseError(
                `expecting start to return void, got ${val}`
            )
        }
    }

    notifyTournamentIsStarting(): void {
        const msg: StartMessage = ["start", [true]]
        this.sendAndAssertVoid(msg)
    }

    notifyPlayAs(color: PenguinColor): void {
        const msg: PlayingAsMessage = ["playing-as", [color]]
        this.sendAndAssertVoid(msg)
    }

    notifyPlayWith(opponentColors: Array<PenguinColor>): void {
        const msg: PlayingWithMessage = ["playing-with", [opponentColors]]
        this.sendAndAssertVoid(msg)
    }

    notifyBanned(reason: string): void {
        this.connection.close()
    }

    notifyOpponentAction(action: Action): void {
        if (action.data.actionType === "eliminatePlayer") {
            this.playerEliminatedSinceLastCall = true
        } else if (action.data.actionType === "move") {
            const origin = action.data.origin as Point
            const dst = action.data.dst as Point

            // TODO: check that arguments to convert are passed in this order
            this.actionHistory.push([
                convertToOutputLocation(origin.x, origin.y),
                convertToOutputLocation(dst.x, dst.y),
            ])
        } else if (action.data.actionType === "skipTurn") {
            this.actionHistory.push(false)
        }
    }

    private getNextPenguinPlacement(gs: GameState): Action {
        const msg: SetupMessage = ["setup", [convertToOutputState(gs)]]
        const result = this.sendAndReceive(msg)

        const position = externalPositionFromAny(result)

        if (!position) {
            throw new IllegalResponseError(
                "received non-position from setup message"
            )
        }

        const playerId = getPlayerWhoseTurnItIs(gs).id
        return createPlacePenguinAction(
            playerId,
            convertToBoardLocation(position[0], position[1])
        )
    }

    private static getMoveActionFromResponse(
        response: any,
        playerId: string
    ): Action {
        if (response === false) {
            return createSkipTurnAction(playerId)
        }

        const externalAction = externalActionFromAny(response)

        if (!externalAction) {
            throw new IllegalResponseError(
                "received non-action from take-turn message"
            )
        }

        const p1 = convertToBoardLocation(
            externalAction[0][0],
            externalAction[0][1]
        )
        const p2 = convertToBoardLocation(
            externalAction[1][0],
            externalAction[1][1]
        )

        return createMoveAction(playerId, p1, p2)
    }

    private getHistory(): Array<ExternalAction> {
        if (this.playerEliminatedSinceLastCall) {
            return []
        }

        return this.actionHistory
    }

    private resetHistory(): void {
        this.playerEliminatedSinceLastCall = false
        this.actionHistory = []
    }

    private getNextPenguinMove(gs: GameState): Action {
        const msg: TakeTurnMessage = [
            "take-turn",
            [convertToOutputState(gs), this.getHistory()],
        ]

        const response = this.sendAndReceive(msg)
        const playerId = getPlayerWhoseTurnItIs(gs).id

        this.resetHistory()
        return PlayerProxy.getMoveActionFromResponse(response, playerId)
    }

    getNextAction(gs: GameState): Action {
        if (gs.phase === "penguinPlacement") {
            return this.getNextPenguinPlacement(gs)
        } else if (gs.phase === "playing") {
            return this.getNextPenguinMove(gs)
        } else {
            throw new IllegalArgumentError(
                "cannot make an action in the over state"
            )
        }
    }

    notifyTournamentOver(didIWin: boolean): void {
        const msg: EndMessage = ["end", [didIWin]]
        this.sendAndAssertVoid(msg)
    }
}

export { PlayerProxy }
