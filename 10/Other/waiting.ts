import * as net from "net"
import { debugPrint } from "./util"
import {
    MAX_PLAYERS_ALLOWED,
    MIN_PLAYERS_NEEDED,
    SocketWithName,
} from "./server"

const INITIAL_WAITING_PERIOD_MS = 30000 // 30s
const PLAYER_NAME_WAIT_MS = 10000

const runWaitingPhase = async (
    server: net.Server
): Promise<Array<SocketWithName>> => {
    let initialPlayers = await runWaitingRoom(server, MAX_PLAYERS_ALLOWED)
    const playersCount = initialPlayers.length

    if (playersCount >= MIN_PLAYERS_NEEDED) {
        return initialPlayers
    } else {
        // run waiting again
        const morePlayers = await runWaitingRoom(
            server,
            MAX_PLAYERS_ALLOWED - playersCount
        )

        return initialPlayers.concat(morePlayers)
    }
}

/**
 * Runs the waiting room part of the server-client protocol for
 * the server. Finishes when either enough players have joined
 * or if this takes too long
 * @param server Server that is accepting connections
 * @param waitForNumPlayers Number of players to wait for
 */
const runWaitingRoom = async (
    server: net.Server,
    waitForNumPlayers: number
): Promise<Array<SocketWithName>> => {
    return new Promise((resolve) => {
        const clients: Array<SocketWithName> = []

        server.on("connection", (conn: net.Socket) => {
            tryRegisterClient(conn)
                .then((sockAndName) => {
                    clients.push(sockAndName)

                    if (clients.length === waitForNumPlayers) {
                        resolve(clients)
                    }
                })
                .catch((err) => {
                    debugPrint(`Didn't register client, reason ${err}`)
                    conn.destroy()
                })
        })

        setTimeout(() => {
            resolve(clients)
        }, INITIAL_WAITING_PERIOD_MS)
    })
}

const tryRegisterClient = async (conn: net.Socket): Promise<SocketWithName> => {
    return new Promise((resolve, reject) => {
        conn.setTimeout(PLAYER_NAME_WAIT_MS)
        conn.on("timeout", () => {
            reject("Timed out waiting for username")
        })

        conn.on("data", (sent: Buffer) => {
            const msg = sent.toString()

            if (validateUsername(msg)) {
                return resolve({
                    name: msg,
                    conn: conn,
                })
            }

            reject(`Given string is not a valid username: ${msg}`)
        })
    })
}

const NAME_MAX_LEN = 12
const NAME_MIN_LEN = 1
const CHAR_MIN = "a".charCodeAt(0)
const CHAR_MAX = "z".charCodeAt(0)

/**
 *
 * @param name
 */
const validateUsername = (name: string): boolean => {
    const len = name.length

    if (len < NAME_MIN_LEN || len > NAME_MAX_LEN) {
        return false
    }

    for (let c of name) {
        const charCode = c.charCodeAt(0)
        if (charCode > CHAR_MAX || charCode < CHAR_MIN) {
            return false
        }
    }

    return true
}

export { runWaitingPhase }
