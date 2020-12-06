import net from "net"
import { Client } from "../proxy/client-proxy"
import { debugPrint } from "../../../../10/Other/util"
const Parser = require("jsonparse")

const PLAYER_CALL_TIMEOUT_MS = 3000

/**
 * Represents a TCP connection wrapper which can send and receive data using JSON.
 * Used by the server side to send and receive data to the client
 */
class Connection {
    private tcpConnection: net.Socket
    private jsonParser: any

    constructor(tcpConnection: net.Socket) {
        this.tcpConnection = tcpConnection
        this.jsonParser = new Parser()
    }

    /**
     * Method to send a type of Message, and expect a response from client.
     *
     * @param method Message sent from server to client
     * @returns the client response
     */
    async send(method: Array<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            const cleanup = () => {
                this.tcpConnection.removeAllListeners()
            }

            const json = JSON.stringify(method)

            this.tcpConnection.on("timeout", () => {
                debugPrint("Client took to long to respond, giving up")
                cleanup()
                reject()
            })

            const self = this.tcpConnection
            this.tcpConnection.on("data", (body) => {
                this.jsonParser.onValue = function (val: any) {
                    if (this.stack.length == 0) {
                        cleanup()
                        resolve(val)
                    }
                }
                this.jsonParser.write(body)
            })

            this.tcpConnection.write(json)
            this.tcpConnection.setTimeout(PLAYER_CALL_TIMEOUT_MS)
        })
    }

    /**
     * Method to send a type data through this connection,
     * does not expect a response.
     *
     * @param data JSON data to send
     */
    sendNoResponse(data: any) {
        const json = JSON.stringify(data)
        this.tcpConnection.write(json)
    }

    close(): void {
        this.tcpConnection.destroy()
    }
}

/**
 * Represents a TCP connection wrapper which can send responses and listen for
 * incoming data.
 * Used by the client to listen for data from the server. Takes a callback
 * function to be able to send data received to specific client side components.
 */
class CallbackConnection {
    private tcpConnection: net.Socket
    private jsonParser: any

    constructor(tcpConnection: net.Socket, client: Client) {
        this.tcpConnection = tcpConnection
        this.jsonParser = new Parser()

        const self = this
        this.jsonParser.onValue = async function (val: any) {
            if (this.stack.length == 0) {
                const response = await client.receive(val)
                self.sendResponse(response)

                if (client.gameIsOver()) {
                    self.close()
                }
            }
        }

        this.tcpConnection.on("data", (body) => {
            this.jsonParser.write(body)
        })
        this.tcpConnection.on("close", () => {
            debugPrint("Connection was unexpectedly closed")
        })
    }

    /**
     * Send a response from the client to the server.
     *
     * @param data JSON data to send to server
     */
    sendResponse(data: any) {
        const json = JSON.stringify(data)
        this.tcpConnection.write(json)
    }

    /**
     * Close this TCP connection.
     */
    close(): void {
        debugPrint("Closing connection and stopping")
        this.tcpConnection.destroy()
        process.exit(0)
    }
}

export { Connection, CallbackConnection }
