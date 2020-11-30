import { PlayerInterface } from "../../../Common/player-interface"
import { StartMessage, verify } from "../common/types"
import { messageSchema, startMessageSchema } from "../common/schemas"
import assert from "assert"

class Client {
    private playerInterface: PlayerInterface

    constructor(playerInterface: PlayerInterface) {
        this.playerInterface = playerInterface
    }

    handleStartMessage(data: any) {
        assert(verify(data, startMessageSchema))
        const startMessage = data as StartMessage

        if (startMessage[1][0]) {
            this.playerInterface.notifyTournamentIsStarting()
        }
    }

    receive(data: any): any {
        // TODO: maybe not crash here?
        assert(verify(data, messageSchema))

        switch (data[0]) {
            case "start":
                this.handleStartMessage(data)
        }
    }
}
