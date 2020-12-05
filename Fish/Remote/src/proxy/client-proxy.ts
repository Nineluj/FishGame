import { PlayerInterface } from "../../../Common/player-interface"
import {
    EndMessage,
    PlayingAsMessage,
    PlayingWithMessage,
    SetupMessage,
    StartMessage,
    TakeTurnMessage,
    verify,
    VoidResponse,
} from "../common/types"
import {
    endMessageSchema,
    messageSchema,
    playingAsMessageSchema,
    playingWithMessageSchema,
    setupMessageSchema,
    startMessageSchema,
    takeTurnMessageSchema,
} from "../common/schemas"
import assert from "assert"
import { deserializeState } from "../../../Common/src/adapters/stateAdapter"
import { GameState } from "../../../Common/src/models/gameState"
import { convertToOutputLocation } from "../../../Common/src/adapters/boardAdapter"
import {
    ExternalAction,
    ExternalPosition,
} from "../../../Common/src/adapters/types"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import { debugPrint } from "../../../../10/Other/util"

class Client {
    private playerInterface: PlayerInterface

    constructor(playerInterface: PlayerInterface) {
        this.playerInterface = playerInterface
    }

    async receive(data: any): Promise<any> {
        // client crash is fine, we can sue the server
        assert(verify(data, messageSchema))

        switch (data[0]) {
            case "start":
                return this.handleStartMessage(data)
            case "playing-as":
                return this.handlePlayingAsMessage(data)
            case "playing-with":
                return this.handlePlayingWithMessage(data)
            case "setup":
                return this.handleSetupMessage(data)
            case "take-turn":
                return this.handleTakeTurnMessage(data)
            case "end":
                return this.handleEndMessage(data)
            default:
                throw new IllegalArgumentError(
                    `Received unexpected message type: ${data[0]}`
                )
        }
    }

    async handleStartMessage(data: any): Promise<VoidResponse> {
        assert(verify(data, startMessageSchema))
        const startMessage = data as StartMessage

        if (startMessage[1][0]) {
            await this.playerInterface.notifyTournamentIsStarting()
        }
        return "void"
    }

    async handlePlayingAsMessage(data: any): Promise<VoidResponse> {
        assert(verify(data, playingAsMessageSchema))
        const playingAsMessage = data as PlayingAsMessage
        await this.playerInterface.notifyPlayAs(playingAsMessage[1][0])
        return "void"
    }

    async handlePlayingWithMessage(data: any): Promise<VoidResponse> {
        assert(verify(data, playingWithMessageSchema))
        const playingWithMessage = data as PlayingWithMessage
        await this.playerInterface.notifyPlayWith(playingWithMessage[1][0])
        return "void"
    }

    async handleSetupMessage(data: any): Promise<ExternalPosition> {
        assert(verify(data, setupMessageSchema))
        const setupMessage = data as SetupMessage
        const state: GameState = deserializeState(
            setupMessage[1][0],
            "penguinPlacement"
        )
        const position = (await this.playerInterface.getNextAction(state)).data
            .dst
        return convertToOutputLocation(position.x, position.y)
    }

    async handleTakeTurnMessage(data: any): Promise<ExternalAction> {
        assert(verify(data, takeTurnMessageSchema))
        const takeTurnMessage = data as TakeTurnMessage
        const state: GameState = deserializeState(
            takeTurnMessage[1][0],
            "playing"
        )

        const action = await this.playerInterface.getNextAction(state)

        if (action.data.actionType === "skipTurn") {
            return false
        } else if (action.data.actionType !== "move") {
            debugPrint(JSON.stringify([action, state], null, 2))
        }

        const origin = action.data.origin
        const dst = action.data.dst

        return [
            convertToOutputLocation(origin.x, origin.y),
            convertToOutputLocation(dst.x, dst.y),
        ]
    }

    async handleEndMessage(data: any): Promise<VoidResponse> {
        assert(verify(data, endMessageSchema))
        const endMessage = data as EndMessage
        await this.playerInterface.notifyTournamentOver(endMessage[1][0])
        return "void"
    }
}

export { Client }
