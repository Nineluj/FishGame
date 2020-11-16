import { expect } from "chai"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import {
    getPlacementState,
    getPlayingState,
} from "../../../Common/src/models/testHelpers/testHelpers"
import { Referee } from "./referee"
import { isDeepStrictEqual } from "util"
import { Board } from "../../../Common/src/models/board"
import { Player } from "../../../Common/src/models/player"
import {
    AIPlayer,
    DEFAULT_MOVES_AHEAD,
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

const playerAI1 = new AIPlayer()
const playerAI2 = new AIPlayer()
const playerAI3 = new AIPlayer()

const allPlayers: Array<PlayerInterface> = [playerAI1, playerAI2, playerAI3]

/**
 * Player that always throws errors for all of its methods
 */
export class ErrorPlayer extends AIPlayer {
    notifyBanned(s: string) {
        throw new IllegalArgumentError("sir this is a Wendies")
    }

    getNextAction(gs: GameState): Action {
        throw new IllegalArgumentError(
            "I don't know how to handle a game state"
        )
    }

    updateGameState(gs: GameState) {
        throw new IllegalArgumentError("what is a game state?")
    }
}

/**
 * Player that generates an invalid move when getNextAction is called
 */
class IllegalActionPlayer extends AIPlayer {
    notifyBanned(s: string) {}

    getNextAction(gs: GameState): Action {
        return createMoveAction("red", { x: 0, y: 0 }, { x: 6, y: 1 })
    }

    updateGameState(gs: GameState) {}
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

        it("Returns correct gamePhase on a game in the playing phase", () => {
            const ref = new Referee(allPlayers, getPlacementState().board)
            ref.runPlacementPhase()
            expect(ref.getGamePhase()).to.equal("playing")
        })

        it("Returns correct gamePhase on a game in the over phase", () => {
            const ref = new Referee(allPlayers, getPlayingState().board)
            ref.runGamePlay()
            expect(ref.getGamePhase()).to.equal("over")
        })
    })

    describe("#getReplay", () => {
        it("Returns correct first part of a replay", () => {
            const ref = new Referee(allPlayers, getPlacementState().board)
            const initialState = ref.getGameState()
            const placementStrategy = getPenguinPlacementStrategy(
                getSkipTurnStrategy()
            )

            ref.runGamePlay()

            const firstActionFromReplay = ref.getReplay()[0]
            const actionFromStrategy = placementStrategy.getNextAction(
                initialState
            )

            expect(actionsEqual(firstActionFromReplay, actionFromStrategy)).to
                .be.true
        })

        it("Returns correct second part of a replay", () => {
            const ref = new Referee(allPlayers, getPlacementState().board)
            ref.runPlacementPhase()

            const actionsCount = ref.getReplay().length
            const startOfPlayingGameState = ref.getGameState()

            const playingStrategy = getPenguinMaxMinMoveStrategy(
                DEFAULT_MOVES_AHEAD,
                getSkipTurnStrategy()
            )

            ref.runGameMovementPhase()

            const firstMoveActionFromReplay = ref.getReplay()[actionsCount]
            const actionFromStrategy = playingStrategy.getNextAction(
                startOfPlayingGameState
            )

            expect(actionsEqual(firstMoveActionFromReplay, actionFromStrategy))
                .to.be.true
        })
    })

    describe("#getPlayerStatuses", () => {
        it("Returns both unbanned and banned players correctly", () => {
            const ref = new Referee(
                [playerAI1, new ErrorPlayer(), playerAI2],
                getPlacementState().board
            )

            ref.runGamePlay()
            const result = ref.getPlayerStatuses()
            expect(result.players).to.have.lengthOf(2)
            expect(result.eliminatedPlayerIds).to.have.lengthOf(1)
            expect(result.eliminatedPlayerIds[0]).to.equal("white")
        })
    })

    describe("#runGamePlay", () => {
        it("runs through an entire game", () => {
            const ref = new Referee(allPlayers, getPlacementState().board)

            ref.runGamePlay()
            expect(ref.getGamePhase()).to.be.equal("over")
            expect(
                ref.getPlayerStatuses().eliminatedPlayerIds.length
            ).to.be.equal(0)
            expect(ref.getPlayerStatuses().players[0].score).to.be.equal(4)
        })
    })
})
