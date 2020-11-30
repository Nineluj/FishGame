import { createServer } from "net"
import { panic } from "./util"
const Parser = require("jsonparse")

const TURN_TIMEOUT_MS = 1000
const CONNECTION_TIMEOUT_MS = 3000

const jsonParser = new Parser()
const parsedObjects: Array<string> = []

// Every time another json value is parsed, add it to the list of parsed objects
jsonParser.onValue = function (val: any) {
    // Check that the parsed value is at the top level of the stream, and not nested
    if (this.stack.length == 0) {
        parsedObjects.push(val)
    }
}

const server = createServer({
    allowHalfOpen: false,
})

server.on("connection", (connection) => {
    connection.on("data", (data) => {
        jsonParser.write(data)
    })

    connection.on("end", () => {
        connection.destroy() // Close socket
        server.close() // Shutdown server
        process.exit(0)
    })
})

/**
 * Returns the port to listen for connections on.
 * Exits process if no valid port number is provided as an argument
 * to this executable, then returns -1
 */
const getPort = (): number => {
    const args = process.argv.slice(2)
    if (args.length > 1) {
        panic("Too many parameters")
    }

    if (args.length === 1) {
        const parsedPort = parseInt(args[0])
        if (isNaN(parsedPort)) {
            panic("Port must be a positive number")
        } else if (parsedPort <= 0) {
            panic("Port must be a positive number")
        }
        return parsedPort
    }

    panic("Must specify port")
    return -1
}

/**
 * Checks if the server has any active connections, if not, terminates the server and program.
 */
const terminateIfNoConnection = (): void => {
    server.getConnections((error, count) => {
        if (count === 0) {
            server.close()
            console.error(
                `Timeout error: No connection within ${
                    CONNECTION_TIMEOUT_MS / 1000
                } seconds`
            )
            process.exit(-1)
        }
    })
}
/**
 * wait 30s for 5 people to connect
 * if not 5 people, then wait another 30 seconds
 * waiting period ends early if 10 people connect
 *
 * after people have signed up:
 * - if enough --> start the tournamanet
 *  - when finished, shut the entire program down, prints results [# winners, # failures/cheaters]
 * - if not enough --> exit program and print something to show not enough people connected
 *
 */
const startServer = async (port: number) => {}

server.listen(getPort())
setTimeout(terminateIfNoConnection, CONNECTION_TIMEOUT_MS)
