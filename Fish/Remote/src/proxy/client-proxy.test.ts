import { expect } from "chai"
import { Message, VoidResponse } from "src/common/types"
import { isDeepStrictEqual } from "util"
import { PlayerInterface } from "../../../Common/player-interface"
import { deserializeState } from "../../../Common/src/adapters/stateAdapter"
import { Action } from "../../../Common/src/models/action"
import { createIdentityAction } from "../../../Common/src/models/action/action"
import { GameState } from "../../../Common/src/models/gameState"
import { PenguinColor } from "../../../Common/src/models/player"
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
    // async getNextAction(gs: GameState): Promise<Action> {
    //     this.output.write(gs.phase)
    //     return createIdentityAction()
    // }
    getNextMove(gs: GameState): Promise<Action> {
        throw new Error("Method not implemented.")
    }
    getNextPlacement(gs: GameState): Promise<Action> {
        throw new Error("Method not implemented.")
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
    describe("#successfully receive messages", () => {
        it("_start_ message successfully received", async () => {
            const startStr = "start"
            const message: Message = [startStr, [true]]
            const response = await client.receive(message)
            expect(playerData).to.be.equal(startStr)
            expectVoid(response)
        })
        it("_playing-as_ message successfully received", async () => {
            const playingStr = "playing-as"
            const color = "red"
            const message: Message = [playingStr, [color]]
            const response = await client.receive(message)

            expect(playerData).to.be.equal(`${playingStr} ${color}`)
            expectVoid(response)
        })
        it("_playing-with_ message successfully received", async () => {
            const playingStr = "playing-with"
            const color = "white"
            const message: Message = [playingStr, [[color]]]
            const response = await client.receive(message)

            expect(playerData).to.be.equal(`${playingStr} ${color}`)
            expectVoid(response)
        })
        // it("_setup_ message successfully received", () => {
        //     const message: Message = ["setup", []]
        //     client.receive(message)
        // })
        // it("_take-turn_ message successfully received", () => {
        //     const message: Message = ["take-turn", []]
        //     client.receive(message)
        // })
        it("_end_ message successfully received", async () => {
            const endStr = "end"
            const message: Message = [endStr, [true]]
            const response = await client.receive(message)

            expect(playerData).to.be.equal(`end won: true`)
            expectVoid(response)
        })
    })
})
