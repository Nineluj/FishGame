import { createServer } from "net"
const Parser = require("jsonparse")

const DEFAULT_PORT = 4567
const TIMEOUT_MS = 3000

const jsonParser = new Parser()
const parsedObjects: Array<string> = []

// Every time another json value is parsed, add it to the list of parsed objects
jsonParser.onValue = function(val: any) {
    // Check that the parsed value is at the top level of the stream, and not nested
    if (this.stack.length == 0) {
        parsedObjects.push(val)
    }
}

const server = createServer({
    allowHalfOpen: true,
})
server.maxConnections = 1

server.on("connection", connection => {
    connection.on("data", data => {
        jsonParser.write(data)
    })

    connection.on("end", () => {
        const objectsWithCount = {
            count: parsedObjects.length,
            seq: parsedObjects,
        }

        // Use the spread operator to create a clone of the array, reverse it,
        // and the spread again to append the items to the end of newly created array
        const reversedObjects = [
            parsedObjects.length,
            ...[...parsedObjects].reverse(),
        ]

        connection.write(JSON.stringify(objectsWithCount))
        connection.write(JSON.stringify(reversedObjects))

        connection.destroy() // Close socket
        server.close() // Shutdown server
        process.exit(0)
    })
})

/**
 * Display usage information for the program and exit with an error code
 * @param message Custom message to display to user after terminating program
 */
const panic = (message: string): void => {
    console.error(`Incorrect usage: ${message}`)
    console.log("usage: ./xtcp <port?>")
    process.exit(-1)
}

/**
 * Returns the port to listen for connections on.
 * Exits process if an incorrect number of arguments are provided
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

    return DEFAULT_PORT
}

/**
 * Checks if the server has any active connections, if not, terminates the server and program.
 */
const terminateIfNoConnection = (): void => {
    server.getConnections((error, count) => {
        if (count === 0) {
            server.close()
            console.error(
                `Timeout error: No connection within ${TIMEOUT_MS /
                    1000} seconds`
            )
            process.exit(-1)
        }
    })
}

server.listen(getPort())
setTimeout(terminateIfNoConnection, TIMEOUT_MS)
