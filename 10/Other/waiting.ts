import * as net from "net"
import { debugPrint } from "./util"
import {
    MAX_PLAYERS_ALLOWED,
    MIN_PLAYERS_NEEDED,
    SocketWithName,
} from "./server"

const INITIAL_WAITING_PERIOD_MS = 30000
const PLAYER_NAME_WAIT_MS = 10000
const ROUNDS_TO_RUN = 2

/**
 * Runs the waiting phase. The phase ends when:
 * - MAX_PLAYERS_ALLOWED players register with the server
 * - Two waiting rounds have been run
 * @param server
 */
const runWaitingPhase = async (
    server: net.Server
): Promise<Array<SocketWithName>> => {
    debugPrint("Starting waiting phase")

    let collectedPlayers: Array<SocketWithName> = []
    let roundsRun = 0

    while (
        collectedPlayers.length < MIN_PLAYERS_NEEDED &&
        roundsRun < ROUNDS_TO_RUN
    ) {
        debugPrint(
            `Running round ${roundsRun} of waiting room. Have (${collectedPlayers.length}) players`
        )

        let newlyRegisteredPlayers = await runWaitingRoom(
            server,
            MAX_PLAYERS_ALLOWED - collectedPlayers.length
        )

        roundsRun++
        collectedPlayers = collectedPlayers.concat(newlyRegisteredPlayers)
    }

    debugPrint(
        `Completed waiting phase with (${collectedPlayers.length}) players`
    )

    return collectedPlayers
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

        const connectionListener = server.on(
            "connection",
            (conn: net.Socket) => {
                tryRegisterClient(conn)
                    .then((sockAndName) => {
                        debugPrint("New client registered")
                        clients.push(sockAndName)

                        if (clients.length === waitForNumPlayers) {
                            debugPrint(
                                `Got enough players in waiting room. Closing it.`
                            )

                            // Closing prevents new connections
                            server.close()
                            resolve(clients)
                        }
                    })
                    .catch((err) => {
                        debugPrint(`Didn't register client, reason: ${err}`)
                        conn.destroy()
                    })
            }
        )

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
const CHAR_MIN = "A".charCodeAt(0)
const CHAR_MAX = "z".charCodeAt(0)

/**
 * Does the given username fit the requirements? Uses length constants
 * - Within length constraints set by NAME_MIN_LEN and NAME_MAX_LEN
 * - Only allows alphabetical characters
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
