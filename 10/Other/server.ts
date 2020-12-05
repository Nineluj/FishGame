import net, { createServer } from "net"
import { debugPrint, panic } from "./util"
import { runWaitingPhase } from "./waiting"
import { PlayerProxy } from "../../Fish/Remote/src/proxy/player-proxy"
import { Connection } from "../../Fish/Remote/src/common/connection"
import {
    Competitor,
    getCompetitorIds,
    TournamentManager,
} from "../../Fish/Admin/src/manager/manager"
import { createBoardWithDimensions } from "../../Fish/Common/src/adapters/boardAdapter"

const MIN_PLAYERS_NEEDED = 4 // TODO: should be 5
const MAX_PLAYERS_ALLOWED = 10

const BOARD_WIDTH = 5
const BOARD_HEIGHT = 5
const NUM_FISH_PER_TILE = 2

type ServerTournamentResults = {
    winnerIds: Array<string>
    failureIds: Array<string>
}

export type SocketWithName = {
    name: string
    conn: net.Socket
}

/**
 * Completes all the tasks for the server:
 * - Get players in a waiting room
 * -
 */
const run = async (port: number) => {
    const server = makeServer(port)
    const registeredRemotePlayers = await runWaitingPhase(server)

    if (registeredRemotePlayers.length < MIN_PLAYERS_NEEDED) {
        panic(
            `Not enough players joined, only got ${registeredRemotePlayers.length}`
        )
    }

    const results = await runTournamentWithManager(registeredRemotePlayers)
    printTournamentResults(results)
    closeConnections(registeredRemotePlayers)
    process.exit(0)
}

const closeConnections = (participants: Array<SocketWithName>): void => {
    debugPrint("Closing any remaining connections")
    participants.forEach((participant) => participant.conn.destroy())
}

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

const makeServer = (port: number): net.Server => {
    const server = createServer({
        allowHalfOpen: false,
    })

    debugPrint("Starting to listen for connections")
    server.listen(port)
    return server
}

const printTournamentResults = (results: ServerTournamentResults) => {
    console.log(
        JSON.stringify([results.winnerIds.length, results.failureIds.length])
    )
}

/**
 * Runs a tournament with the registered players
 */
const runTournamentWithManager = async (
    remotePlayersConns: Array<SocketWithName>
): Promise<ServerTournamentResults> => {
    const competitors = createRemoteCompetitors(remotePlayersConns)

    const manager = new TournamentManager(competitors, () =>
        createBoardWithDimensions(BOARD_WIDTH, BOARD_HEIGHT, NUM_FISH_PER_TILE)
    )
    const winners = await manager.runTournament()
    const failureIds = manager.getFailures()

    return {
        winnerIds: getCompetitorIds(winners),
        failureIds: failureIds,
    }
}

/**
 * Creates competitors from the socket and names
 */
const createRemoteCompetitors = (
    registeredRemotePlayers: Array<SocketWithName>
): Array<Competitor> =>
    registeredRemotePlayers.map((sockWithName, index) => {
        const connObj = new Connection(sockWithName.conn)
        const playerInterface = new PlayerProxy(connObj)

        return {
            age: index,
            ai: playerInterface,
            id: sockWithName.name,
        }
    })

if (require.main === module) {
    run(getPort())
}

export { MIN_PLAYERS_NEEDED, MAX_PLAYERS_ALLOWED }
