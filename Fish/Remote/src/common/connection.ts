import net from "net"
const Parser = require("jsonparse")

const PLAYER_CALL_TIMEOUT_MS = 1000

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
            const json = JSON.stringify(method)

            this.tcpConnection.on("timeout", () => {
                reject()
            })
            this.tcpConnection.on("data", (body) => {
                this.jsonParser.onValue = function (val: any) {
                    if (this.stack.length == 0) {
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

    constructor(tcpConnection: net.Socket, fn: (a: any) => any) {
        this.tcpConnection = tcpConnection
        this.jsonParser = new Parser()

        this.jsonParser.onValue = function (val: any) {
            if (this.stack.length == 0) {
                const response = fn(val)
                this.sendResponse(response)
            }
        }

        this.tcpConnection.on("data", (body) => {
            this.jsonParser.write(body)
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
        this.tcpConnection.destroy()
    }
}

export { Connection, CallbackConnection }
