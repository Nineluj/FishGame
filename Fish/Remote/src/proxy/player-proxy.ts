import { Connection } from "../common/connection"
import { PlayerInterface } from "../../../Common/player-interface"
import { Action } from "../../../Common/src/models/action"
import {
    GameState,
    getPlayerWhoseTurnItIs,
} from "../../../Common/src/models/gameState"
import {
    EndMessage,
    Message,
    PlayingAsMessage,
    PlayingWithMessage,
    SetupMessage,
    StartMessage,
    TakeTurnMessage,
} from "../common/types"
import { IllegalResponseError } from "../../../Common/src/models/errors/illegalResponseError"
import { PenguinColor } from "../../../Common/src/models/player"
import { convertToOutputState } from "../../../Common/src/adapters/stateAdapter"
import {
    createMoveAction,
    createPlacePenguinAction,
    createSkipTurnAction,
} from "../../../Common/src/models/action/action"
import {
    convertToBoardLocation,
    convertToOutputLocation,
} from "../../../Common/src/adapters/boardAdapter"
import {
    ExternalAction,
    externalActionFromAny,
    externalPositionFromAny,
} from "../../../Common/src/adapters/types"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import { Point } from "../../../Common/src/models/point"
import { debugPrint } from "../../../../10/Other/util"

class PlayerProxy implements PlayerInterface {
    private connection: Connection

    constructor(connection: Connection) {
        this.connection = connection
    }

    private async sendAndReceive(msg: Message): Promise<any> {
        return await this.connection.send(msg)
    }

    /**
     * Sends the given message, reads the result and asserts
     * that it is equal to the string void
     */
    private async sendAndAssertVoid(msg: Message) {
        const result = await this.sendAndReceive(msg)
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

    async notifyTournamentIsStarting() {
        const msg: StartMessage = ["start", [true]]
        await this.sendAndAssertVoid(msg)
    }

    async notifyPlayAs(color: PenguinColor) {
        const msg: PlayingAsMessage = ["playing-as", [color]]
        await this.sendAndAssertVoid(msg)
    }

    async notifyPlayWith(opponentColors: Array<PenguinColor>) {
        const msg: PlayingWithMessage = ["playing-with", [opponentColors]]
        await this.sendAndAssertVoid(msg)
    }

    async notifyBanned(reason: string) {
        this.connection.close()
    }

    private async getNextPenguinPlacement(gs: GameState): Promise<Action> {
        const outState = convertToOutputState(gs)
        const msg: SetupMessage = ["setup", [outState]]
        const result = await this.sendAndReceive(msg)

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

    private async getNextPenguinMove(gs: GameState): Promise<Action> {
        // not reporting the list of actions, only the new gameState
        const msg: TakeTurnMessage = [
            "take-turn",
            [convertToOutputState(gs), []],
        ]

        const response = await this.sendAndReceive(msg)
        const playerId = getPlayerWhoseTurnItIs(gs).id

        return PlayerProxy.getMoveActionFromResponse(response, playerId)
    }

    async getNextAction(gs: GameState): Promise<Action> {
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

    async notifyTournamentOver(didIWin: boolean): Promise<void> {
        const msg: EndMessage = ["end", [didIWin]]
        return this.sendAndAssertVoid(msg)
    }
}

export { PlayerProxy }
