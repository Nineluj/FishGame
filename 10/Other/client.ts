import { Socket } from "net"
import { debugPrint, panic, setDebugPrintPrefix } from "./util"

import { CallbackConnection } from "../../Fish/Remote/src/common/connection"
import { Client } from "../../Fish/Remote/src/proxy/client-proxy"
import { AIPlayer } from "../../Fish/Player/src/player/player"

const DEFAULT_IP_ADDRESS = "127.0.0.1"
const DEPTH = 2

const consoleWriteable = {
    write(s: string): void {
        console.log(s)
    },
}
/**
 * Parse port number and IP address from command line args.
 * If no IP address is given, use default local host.
 */
const parsePortAddress = (): { port: number; ip: string } => {
    const args = process.argv.slice(2)
    console.log("parsing args", args)
    if (args.length > 2 || args.length === 0) {
        panic("Wrong number of arguments")
    }

    return {
        port: parseInt(args[0]),
        ip: args.length === 2 ? args[1] : DEFAULT_IP_ADDRESS,
    }
}

const runClient = () => {
    const name = createName()
    setDebugPrintPrefix(`${name}>`)
    debugPrint("Started client")

    const portAddress = parsePortAddress()
    const socket = new Socket()
    socket.connect({ port: portAddress.port, host: portAddress.ip })
    socket.write(createName())
    const player = new AIPlayer(consoleWriteable, DEPTH)
    const client = new Client(player)
    new CallbackConnection(socket, client.receive)
}

/**
 * Create a new pseudo-random name.
 */
const createName = () => {
    let name = ""
    const alphabet = "abcdefghijklmnopqrstuvwxyz"
    for (let x = process.pid; x > 0; x = Math.floor(x / 10)) {
        name += alphabet[x % alphabet.length]
    }
    return name
}

if (require.main === module) {
    runClient()
}
