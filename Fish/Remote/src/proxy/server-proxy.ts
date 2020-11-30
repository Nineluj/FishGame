import { PlayerInterface } from "../../../Common/player-interface"
import { Message } from "../common/types"

/*
server:
    ...
    callbackConnection(..., ServerProxyInstance.receiveMessage, ...)
 */

class Client {
    private playerInterface: PlayerInterface

    constructor(playerInterface: PlayerInterface) {
        this.playerInterface = playerInterface
    }

    private checkStartMessageSyntax() {}

    handleStartMessage(args: Array<any>) {}

    receiveMessage(msg: Message): any {
        switch (msg[0]) {
            case "start":
                this.handleStartMessage(msg[1])
        }
    }
}
