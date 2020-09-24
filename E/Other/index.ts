import { createServer } from "net"
const Parser = require("jsonparse")

const DEFAULT_PORT = 4567
// TODO close connection after 3 second

const server = createServer({
    allowHalfOpen: true,
})
server.maxConnections = 1

const jsonParser = new Parser()
const parsedObjects: Array<string> = []

// Every time another json value is parsed, add it to the list of parsed objects
jsonParser.onValue = function(val: any) {
    // Check that the parsed value is at the top level of the stream, and not nested
    if (this.stack.length == 0) {
        parsedObjects.push(val)
    }
}

server.on("connection", connection => {
    connection.on("data", data => {
        jsonParser.write(data)
    })

    connection.on("end", () => {
        // We have all the objects inside of "objects"
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
    })
})

const args = process.argv.slice(2)
if (args.length > 1) {
    console.error("Incorrect usage: Too many parameters")
    console.log("usage: ./xtcp <port?>")
}
const port = args.length == 1 ? args[0] : DEFAULT_PORT

server.listen(port)
