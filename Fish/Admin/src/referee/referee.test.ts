import { expect } from "chai"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import {
    getPlacementState,
    getPlayingState,
} from "../../../Common/src/models/testHelpers"
import { GameObserver, GameResult, Referee } from "./referee"
import { isDeepStrictEqual } from "util"
import {
    AIPlayer,
    DEFAULT_MOVES_AHEAD,
    Writeable,
} from "../../../Player/src/player/player"
import { PlayerInterface } from "../../../Common/player-interface"
import { Action } from "../../../Common/src/models/action"
import { GameState } from "../../../Common/src/models/gameState"
import {
    createMoveAction,
    actionsEqual,
} from "../../../Common/src/models/action/action"
import {
    getPenguinMaxMinMoveStrategy,
    getSkipTurnStrategy,
    getPenguinPlacementStrategy,
} from "../../../Player/src/strategy/strategy"
import { PenguinColor } from "../../../Common/src/models/player"

const playerAI1 = new AIPlayer()
const playerAI2 = new AIPlayer()
const playerAI3 = new AIPlayer()

const allPlayers: Array<PlayerInterface> = [playerAI1, playerAI2, playerAI3]

const functionsCanFailNum = 7
export const makeFunctionalFailWhich = () =>
    Array(functionsCanFailNum).fill(false)
export const makeGetNextActionErrorPlayer = (): ErrorPlayer => {
    const fw = makeFunctionalFailWhich()
    fw[3] = true
    return new ErrorPlayer(fw)
}

/**
 * Player that always throws errors for on select methods. Failure is based
 * on which fields in the given boolean array are set to true. Indexes:
 * - 0 for notifyBanned
 * - 1 for notifyPlayAs
 * - 2 for notifyPlayWith
 * - 3 for getNextAction
 * - 4 for notifyOpponentAction
 * - 5 for notifyTournamentStarting
 * - 6 for notifyTournamentOver
 * Behaves the same as an AIPlayer if all the fields are false
 */
export class ErrorPlayer extends AIPlayer {
    failWhich: boolean[]

    constructor(failWhich: boolean[], output?: Writeable) {
        if (output) {
            super(output)
        } else {
            super()
        }

        this.failWhich = failWhich
    }

    async notifyBanned(s: string) {
        if (this.failWhich[0]) {
            throw new IllegalArgumentError(
                "error player does not like notifyBanned"
            )
        } else {
            return super.notifyBanned(s)
        }
    }

    async notifyPlayAs(pc: PenguinColor) {
        if (this.failWhich[1]) {
            throw new IllegalArgumentError(
                "error player does not like notifyPlayAs"
            )
        } else {
            return super.notifyPlayAs(pc)
        }
    }

    async notifyPlayWith(playerColors: PenguinColor[]) {
        if (this.failWhich[2]) {
            throw new IllegalArgumentError(
                "error player does not like notifyPlayWith"
            )
        } else {
            return super.notifyPlayWith(playerColors)
        }
    }

    async getNextAction(gs: GameState): Promise<Action> {
        if (this.failWhich[3]) {
            throw new IllegalArgumentError(
                "error player does not like getNextAction"
            )
        } else {
            return super.getNextAction(gs)
        }
    }

    async notifyTournamentIsStarting(): Promise<void> {
        if (this.failWhich[5]) {
            throw new IllegalArgumentError(
                "error player does not like notifyTournamentIsStarting"
            )
        } else {
            return super.notifyTournamentIsStarting()
        }
    }

    async notifyTournamentOver(didIWin: boolean): Promise<void> {
        if (this.failWhich[6]) {
            throw new IllegalArgumentError(
                "error player does not like notifyTournamentOver"
            )
        } else {
            return super.notifyTournamentOver(didIWin)
        }
    }
}

/**
 * Player that generates an invalid move when getNextAction is called
 */
export class IllegalActionPlayer extends AIPlayer {
    async notifyBanned(s: string) {}

    async getNextAction(gs: GameState): Promise<Action> {
        return createMoveAction("red", { x: 0, y: 0 }, { x: 6, y: 1 })
    }

    updateGameState(gs: GameState) {}
}

class NotifyBannedCrasher extends ErrorPlayer {
    constructor() {
        const failWhich = makeFunctionalFailWhich()
        failWhich[0] = true
        super(failWhich)
    }

    async getNextAction(gs: GameState): Promise<Action> {
        return new IllegalActionPlayer().getNextAction(gs)
    }
}

/**
 * Observer that keeps all updates received by referee.
 */
class LoggingObserver implements GameObserver {
    public states: Array<GameState>
    public result: GameResult | undefined
    constructor() {
        this.states = []
        this.result = undefined
    }

    async update(gs: GameState) {
        this.states.push(gs)
    }
    async notifyOver(result: GameResult) {
        this.result = result
    }
}

/**
 *  Observer which raises errors when update is called.
 */
class ErroringObserver implements GameObserver {
    async update(gs: GameState) {
        throw new IllegalArgumentError("receiving a state I will not accept")
    }
    async notifyOver(result: GameResult) {
        // won't do anything
    }
}

describe("Referee", () => {
    describe("#constructor", () => {
        it("handles proper argument gracefully", () => {
            expect(() => {
                new Referee(allPlayers)
            }).not.to.throw()
        })

        it("throws an error when given too many or few players", () => {
            expect(() => {
                new Referee([])
            }).to.throw(IllegalArgumentError)

            expect(() => {
                new Referee([
                    allPlayers[0],
                    allPlayers[1],
                    allPlayers[2],
                    allPlayers[0],
                    allPlayers[2],
                ])
            })
        })
    })

    describe("#createGamePlayers", () => {
        it("assigns distinct colors to more players", () => {
            const fourPlayers = Referee.createGamePlayers(4)
            expect(fourPlayers.length).to.equal(4)
            fourPlayers.forEach((player) => {
                expect(
                    fourPlayers.filter(
                        (otherPlayer) =>
                            player.penguinColor === otherPlayer.penguinColor
                    )
                ).to.have.lengthOf(1)
            })
        })
        it("errors when given too many players", () => {
            expect(() => Referee.createGamePlayers(90)).to.throw(
                IllegalArgumentError,
                "Number of players must be between 2 and 4 received 90"
            )
        })
        it("errors when given too few players", () => {
            expect(() => Referee.createGamePlayers(1)).to.throw(
                IllegalArgumentError,
                "Number of players must be between 2 and 4 received 1"
            )
        })
    })

    describe("#getGameState", () => {
        it("Returns a valid and correct gamestate", () => {
            const ref = new Referee(allPlayers)

            const expected = {
                board: [
                    [
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                    ],
                    [
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                    ],
                    [
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                    ],
                    [
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                    ],
                ],
                phase: "penguinPlacement",
                players: [
                    { id: "red", penguinColor: "red", penguins: [], score: 0 },
                    {
                        id: "white",
                        penguinColor: "white",
                        penguins: [],
                        score: 0,
                    },
                    {
                        id: "brown",
                        penguinColor: "brown",
                        penguins: [],
                        score: 0,
                    },
                ],
            }

            expect(isDeepStrictEqual(ref.getGameState(), expected)).to.be.true
        })
    })

    describe("#getGamePhase", () => {
        it("Returns correct initial gamePhase on a new game", () => {
            const ref = new Referee(allPlayers)
            expect(ref.getGamePhase()).to.equal("penguinPlacement")
        })

        it("Returns correct gamePhase on a game in the playing phase", async () => {
            const ref = new Referee(allPlayers, getPlacementState().board)
            await ref.runPlacementPhase()
            expect(ref.getGamePhase()).to.equal("playing")
        })

        it("Returns correct gamePhase on a game in the over phase", async () => {
            const ref = new Referee(allPlayers, getPlayingState().board)
            await ref.runGamePlay()
            expect(ref.getGamePhase()).to.equal("over")
        })
    })

    describe("#getReplay", () => {
        it("Returns correct first part of a replay", async () => {
            const ref = new Referee(allPlayers, getPlacementState().board)
            const initialState = ref.getGameState()
            const placementStrategy = getPenguinPlacementStrategy(
                getSkipTurnStrategy()
            )

            await ref.runGamePlay()

            const firstActionFromReplay = ref.getReplay()[0]
            const actionFromStrategy = placementStrategy.getNextAction(
                initialState
            )

            expect(actionsEqual(firstActionFromReplay, actionFromStrategy)).to
                .be.true
        })

        it("Returns correct second part of a replay", async () => {
            const ref = new Referee(allPlayers, getPlacementState().board)
            await ref.runPlacementPhase()

            const actionsCount = ref.getReplay().length
            const startOfPlayingGameState = ref.getGameState()

            const playingStrategy = getPenguinMaxMinMoveStrategy(
                DEFAULT_MOVES_AHEAD,
                getSkipTurnStrategy()
            )

            await ref.runGameMovementPhase()

            const firstMoveActionFromReplay = ref.getReplay()[actionsCount]
            const actionFromStrategy = playingStrategy.getNextAction(
                startOfPlayingGameState
            )

            expect(actionsEqual(firstMoveActionFromReplay, actionFromStrategy))
                .to.be.true
        })
    })

    describe("#getPlayerStatuses", () => {
        it("Returns both unbanned and banned players correctly", async () => {
            const ref = new Referee(
                [
                    playerAI1,
                    new ErrorPlayer([true, true, true, true]),
                    playerAI2,
                ],
                getPlacementState().board
            )

            await ref.runGamePlay()
            const result = ref.getPlayerStatuses()
            expect(result.players).to.have.lengthOf(2)
            expect(result.eliminatedPlayerIds).to.have.lengthOf(1)
            expect(result.eliminatedPlayerIds[0]).to.equal("white")
        })
    })

    describe("#runGamePlay", () => {
        it("runs through an entire game", async () => {
            const ref = new Referee(allPlayers, getPlacementState().board)

            await ref.runGamePlay()
            expect(ref.getGamePhase()).to.be.equal("over")
            expect(
                ref.getPlayerStatuses().eliminatedPlayerIds.length
            ).to.be.equal(0)
            expect(ref.getPlayerStatuses().players[0].score).to.be.equal(4)
        })
    })

    describe("#with failing players", () => {
        // Testing for failures
        it("player that misbehaves on notifyBanned is handled", async () => {
            const ref = new Referee(
                [playerAI1, new NotifyBannedCrasher(), playerAI2],
                getPlacementState().board,
                ["p1", "errorP", "p3"]
            )

            await ref.runGamePlay()

            expect(ref.getPlayerStatuses().eliminatedPlayerIds).to.contain(
                "errorP"
            )
        })

        // sets up a game with a referee and a player that will fail in a
        // given way. See ErrorPlayer to see the ways in which these failures occur
        const failInIthWay = async (i: number): Promise<Referee> => {
            let failWay = Array(functionsCanFailNum).fill(false)
            failWay[i] = true

            const ref = new Referee( // error player [1] is playAs, [2] is playWith
                [playerAI1, new ErrorPlayer(failWay), playerAI2],
                getPlacementState().board,
                ["p1", "errorP", "p3"]
            )

            await ref.runGamePlay()
            return ref
        }

        it("puts player that fails to accept color into failures", async () => {
            const ref = await failInIthWay(1)

            expect(ref.getPlayerStatuses().eliminatedPlayerIds).to.contain(
                "errorP"
            )
        })

        it("puts player that fails to accept all the colors for this game into failures", async () => {
            const ref = await failInIthWay(2)

            expect(ref.getPlayerStatuses().eliminatedPlayerIds).to.contain(
                "errorP"
            )
        })

        it("puts player that fails on getNextAction into failures", async () => {
            const ref = await failInIthWay(3)

            expect(ref.getPlayerStatuses().eliminatedPlayerIds).to.contain(
                "errorP"
            )
        })
    })

    describe("#observers", () => {
        it("successful register game observer", () => {
            const ref = new Referee(allPlayers)
            const observer = new LoggingObserver()
            expect(ref.getGameObservers()).to.be.empty
            ref.registerGameObserver(observer)
            expect(ref.getGameObservers().length).to.be.equal(1)
        })

        it("observer receives updates about the game", async () => {
            const ref = new Referee(allPlayers)
            const observer = new LoggingObserver()
            ref.registerGameObserver(observer)
            await ref.runGamePlay()
            expect(observer.states).to.not.be.empty

            const expectedRes = {
                failures: [],
                losers: ["red", "white"],
                winners: ["brown"],
            }
            expect(isDeepStrictEqual(observer.result, expectedRes)).to.be.true
        })

        it("observer which throws error is removed", async () => {
            const ref = new Referee(allPlayers)
            const observer = new ErroringObserver()
            ref.registerGameObserver(observer)
            expect(ref.getGameObservers().length).to.be.equal(1)
            await ref.playTurn()

            setTimeout(() => expect(ref.getGameObservers()).to.be.empty, 300)
        })
    })
})
