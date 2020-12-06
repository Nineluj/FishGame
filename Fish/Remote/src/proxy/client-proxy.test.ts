const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
const expect = chai.expect
chai.use(chaiAsPromised)
import {
    EndMessage,
    Message,
    PlayingAsMessage,
    PlayingWithMessage,
    SetupMessage,
    StartMessage,
    TakeTurnMessage,
} from "src/common/types"
import { isDeepStrictEqual } from "util"
import { PlayerInterface } from "../../../Common/player-interface"
import {
    ExternalPlayer,
    ExternalState,
} from "../../../Common/src/adapters/types"
import { Action } from "../../../Common/src/models/action"
import {
    createMoveAction,
    createPlacePenguinAction,
} from "../../../Common/src/models/action/action"
import { GameState } from "../../../Common/src/models/gameState"
import { PenguinColor } from "../../../Common/src/models/player"
import { Point } from "../../../Common/src/models/point"
import { Writeable } from "../../../Player/src/player/player"
import { Client } from "./client-proxy"

/**
 * Test player used to test client receive and dispatch methods.
 */
class TestPlayer implements PlayerInterface {
    output: Writeable

    constructor(writable: Writeable) {
        this.output = writable
    }

    async notifyPlayAs(color: PenguinColor): Promise<void> {
        this.output.write(`playing-as ${color}`)
    }
    async notifyPlayWith(opponentColors: PenguinColor[]): Promise<void> {
        this.output.write(`playing-with ${opponentColors}`)
    }
    async notifyBanned(reason: string): Promise<void> {
        throw new Error("Method not implemented.")
    }
    async getNextMove(gs: GameState): Promise<Action> {
        const origin: Point = { x: 0, y: 0 }
        const dest: Point = { x: 1, y: 0 }
        return createMoveAction("id", origin, dest)
    }
    async getNextPlacement(gs: GameState): Promise<Action> {
        const origin: Point = { x: 0, y: 0 }
        return createPlacePenguinAction("id", origin)
    }

    async notifyTournamentIsStarting(): Promise<void> {
        this.output.write("start")
    }
    async notifyTournamentOver(didIWin: boolean): Promise<void> {
        this.output.write(`end won: ${didIWin}`)
    }
}

const expectVoid = (res: string) => {
    return expect(res).to.be.equal("void")
}

describe("Client", () => {
    let remotePlayer: PlayerInterface
    let client: Client
    let playerData: string

    // TESTING UTILS FOR MESSAGES
    const extPlayer: ExternalPlayer = {
        color: "white",
        score: 0,
        places: [],
    }
    const boardArr: Array<Array<number>> = [
        [2, 2, 2, 2],
        [2, 2, 2, 2],
    ]
    const extState: ExternalState = {
        players: [extPlayer, extPlayer, extPlayer],
        board: boardArr,
    }

    beforeEach(function () {
        playerData = ""
        const customWriter = {
            write(s: string): void {
                playerData = s
            },
        }
        remotePlayer = new TestPlayer(customWriter)
        client = new Client(remotePlayer)
    })

    // SUCCESSFUL RECEIVE MESSAGES --------------------------------------------
    describe("#successfully receive messages", () => {
        it("_start_ message successfully received", async () => {
            const startStr = "start"
            const message: StartMessage = [startStr, [true]]
            const response = await client.receive(message)
            expect(playerData).to.be.equal(startStr)
            expectVoid(response)
        })
        it("_playing-as_ message successfully received", async () => {
            const playingStr = "playing-as"
            const color = "red"
            const message: PlayingAsMessage = [playingStr, [color]]
            const response = await client.receive(message)

            expect(playerData).to.be.equal(`${playingStr} ${color}`)
            expectVoid(response)
        })
        it("_playing-with_ message successfully received", async () => {
            const playingStr = "playing-with"
            const color = "white"
            const message: PlayingWithMessage = [playingStr, [[color]]]
            const response = await client.receive(message)
            expect(playerData).to.be.equal(`${playingStr} ${color}`)
            expectVoid(response)
        })
        it("_setup_ message successfully received", async () => {
            const message: SetupMessage = ["setup", [extState]]
            const response = await client.receive(message)
            isDeepStrictEqual(response, [0, 0])
        })
        it("_take-turn_ message successfully received", async () => {
            const message: TakeTurnMessage = ["take-turn", [extState, []]]
            const response = await client.receive(message)
            isDeepStrictEqual(response, [
                [0, 0],
                [1, 0],
            ])
        })
        it("_end_ message successfully received", async () => {
            const endStr = "end"
            const message: EndMessage = [endStr, [true]]
            const response = await client.receive(message)
            expectVoid(response)
        })
    })
    // FAILED RECEIVE MESSAGES ------------------------------------------------
    describe("#failed to receive messages", () => {
        it("non existent message type", async () => {
            const badStr = "bad"
            const message: Message = [badStr, []]
            await expect(client.receive(message)).to.be.rejected
        })
        it("bad message format", async () => {
            const message = ["start", true]
            await expect(client.receive(message)).to.be.rejected
        })
    })
})
