import { expect } from "chai"
import { createRootGameNode, completeAction } from "./tree"
import { createGameState, GameState } from "../gameState/gameState"
import { getPlayingState } from "../testHelpers"
import { GamePhaseError } from "../errors/gamePhaseError"
import { createPlayer } from "../testHelpers/testHelpers"
import { isDeepStrictEqual } from "util"
import { GameStateActionError } from "../errors/gameStateActionError"

describe("Game Tree", () => {
    describe("#creation", () => {
        it("cannot be created with a game that has not started yet", () => {
            expect(() => {
                createRootGameNode(
                    createGameState([
                        createPlayer(15, "red", "foo"),
                        createPlayer(20, "black", "bar"),
                        createPlayer(25, "brown", "baz"),
                    ])
                )
            }).to.throw(
                GamePhaseError,
                "Cannot construct a game node for a game that hasn't begun or has already ended"
            )
        })
        it("cannot be created with a game that has already ended", () => {
            expect(true).to.equal(false)
        })
        it("can be created for a game that is in the playing phase", () => {
            const gameNode = createRootGameNode(getPlayingState())
            // console.log(JSON.stringify(gameNode.children()))
            const expected = {
                action: { data: { actionType: "identity" } },
                gs: {
                    board: [
                        [
                            { fish: 0, occupied: true },
                            { fish: 0, occupied: true },
                            { fish: 0, occupied: true },
                        ],
                        [
                            { fish: 2, occupied: false },
                            { fish: 2, occupied: false },
                        ],
                        [
                            { fish: 2, occupied: false },
                            { fish: 0, occupied: true },
                            { fish: 0, occupied: true },
                        ],
                        [
                            { fish: 0, occupied: true },
                            { fish: 0, occupied: true },
                        ],
                        [
                            { fish: 0, occupied: true },
                            { fish: 2, occupied: false },
                            { fish: 0, occupied: true },
                        ],
                        [
                            { fish: 2, occupied: false },
                            { fish: 2, occupied: false },
                        ],
                    ],
                    phase: "playing",
                    players: [
                        {
                            age: 1,
                            id: "p1",
                            penguinColor: "black",
                            penguins: [
                                { x: 0, y: 0 },
                                { x: 3, y: 1 },
                                { x: 2, y: 1 },
                            ],
                            score: 6,
                        },
                        {
                            age: 2,
                            id: "p2",
                            penguinColor: "brown",
                            penguins: [
                                { x: 0, y: 1 },
                                { x: 4, y: 2 },
                                { x: 3, y: 0 },
                            ],
                            score: 6,
                        },
                        {
                            age: 3,
                            id: "p3",
                            penguinColor: "red",
                            penguins: [
                                { x: 0, y: 2 },
                                { x: 4, y: 0 },
                                { x: 2, y: 2 },
                            ],
                            score: 6,
                        },
                    ],
                    turn: 9,
                },
                children: [{ "action": { "data": { "actionType": "move", "playerId": "p1", "origin": { "x": 0, "y": 0 }, "dst": { "x": 1, "y": 0, "tile": { "fish": 2, "occupied": false } } } }, "gs": { "board": [["hole", { "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "occupied": true, "fish": 2 }, { "fish": 2, "occupied": false }], [{ "fish": 2, "occupied": false }, { "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "fish": 0, "occupied": true }, { "fish": 2, "occupied": false }, { "fish": 0, "occupied": true }], [{ "fish": 2, "occupied": false }, { "fish": 2, "occupied": false }]], "phase": "playing", "players": [{ "age": 1, "id": "p1", "penguinColor": "black", "penguins": [{ "x": 1, "y": 0, "tile": { "fish": 2, "occupied": false } }, { "x": 3, "y": 1 }, { "x": 2, "y": 1 }], "score": 8 }, { "age": 2, "id": "p2", "penguinColor": "brown", "penguins": [{ "x": 0, "y": 1 }, { "x": 4, "y": 2 }, { "x": 3, "y": 0 }], "score": 6 }, { "age": 3, "id": "p3", "penguinColor": "red", "penguins": [{ "x": 0, "y": 2 }, { "x": 4, "y": 0 }, { "x": 2, "y": 2 }], "score": 6 }], "turn": 10 } }, { "action": { "data": { "actionType": "move", "playerId": "p1", "origin": { "x": 3, "y": 1 }, "dst": { "x": 4, "y": 1, "tile": { "fish": 2, "occupied": false } } } }, "gs": { "board": [[{ "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "fish": 2, "occupied": false }, { "fish": 2, "occupied": false }], [{ "fish": 2, "occupied": false }, { "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "fish": 0, "occupied": true }, "hole"], [{ "fish": 0, "occupied": true }, { "occupied": true, "fish": 2 }, { "fish": 0, "occupied": true }], [{ "fish": 2, "occupied": false }, { "fish": 2, "occupied": false }]], "phase": "playing", "players": [{ "age": 1, "id": "p1", "penguinColor": "black", "penguins": [{ "x": 0, "y": 0 }, { "x": 4, "y": 1, "tile": { "fish": 2, "occupied": false } }, { "x": 2, "y": 1 }], "score": 8 }, { "age": 2, "id": "p2", "penguinColor": "brown", "penguins": [{ "x": 0, "y": 1 }, { "x": 4, "y": 2 }, { "x": 3, "y": 0 }], "score": 6 }, { "age": 3, "id": "p3", "penguinColor": "red", "penguins": [{ "x": 0, "y": 2 }, { "x": 4, "y": 0 }, { "x": 2, "y": 2 }], "score": 6 }], "turn": 10 } }, { "action": { "data": { "actionType": "move", "playerId": "p1", "origin": { "x": 3, "y": 1 }, "dst": { "x": 5, "y": 0, "tile": { "fish": 2, "occupied": false } } } }, "gs": { "board": [[{ "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "fish": 2, "occupied": false }, { "fish": 2, "occupied": false }], [{ "fish": 2, "occupied": false }, { "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "fish": 0, "occupied": true }, "hole"], [{ "fish": 0, "occupied": true }, { "fish": 2, "occupied": false }, { "fish": 0, "occupied": true }], [{ "occupied": true, "fish": 2 }, { "fish": 2, "occupied": false }]], "phase": "playing", "players": [{ "age": 1, "id": "p1", "penguinColor": "black", "penguins": [{ "x": 0, "y": 0 }, { "x": 5, "y": 0, "tile": { "fish": 2, "occupied": false } }, { "x": 2, "y": 1 }], "score": 8 }, { "age": 2, "id": "p2", "penguinColor": "brown", "penguins": [{ "x": 0, "y": 1 }, { "x": 4, "y": 2 }, { "x": 3, "y": 0 }], "score": 6 }, { "age": 3, "id": "p3", "penguinColor": "red", "penguins": [{ "x": 0, "y": 2 }, { "x": 4, "y": 0 }, { "x": 2, "y": 2 }], "score": 6 }], "turn": 10 } }, { "action": { "data": { "actionType": "move", "playerId": "p1", "origin": { "x": 2, "y": 1 }, "dst": { "x": 2, "y": 0, "tile": { "fish": 2, "occupied": false } } } }, "gs": { "board": [[{ "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "fish": 2, "occupied": false }, { "fish": 2, "occupied": false }], [{ "occupied": true, "fish": 2 }, "hole", { "fish": 0, "occupied": true }], [{ "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "fish": 0, "occupied": true }, { "fish": 2, "occupied": false }, { "fish": 0, "occupied": true }], [{ "fish": 2, "occupied": false }, { "fish": 2, "occupied": false }]], "phase": "playing", "players": [{ "age": 1, "id": "p1", "penguinColor": "black", "penguins": [{ "x": 0, "y": 0 }, { "x": 3, "y": 1 }, { "x": 2, "y": 0, "tile": { "fish": 2, "occupied": false } }], "score": 8 }, { "age": 2, "id": "p2", "penguinColor": "brown", "penguins": [{ "x": 0, "y": 1 }, { "x": 4, "y": 2 }, { "x": 3, "y": 0 }], "score": 6 }, { "age": 3, "id": "p3", "penguinColor": "red", "penguins": [{ "x": 0, "y": 2 }, { "x": 4, "y": 0 }, { "x": 2, "y": 2 }], "score": 6 }], "turn": 10 } }, { "action": { "data": { "actionType": "move", "playerId": "p1", "origin": { "x": 2, "y": 1 }, "dst": { "x": 1, "y": 1, "tile": { "fish": 2, "occupied": false } } } }, "gs": { "board": [[{ "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "fish": 2, "occupied": false }, { "occupied": true, "fish": 2 }], [{ "fish": 2, "occupied": false }, "hole", { "fish": 0, "occupied": true }], [{ "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "fish": 0, "occupied": true }, { "fish": 2, "occupied": false }, { "fish": 0, "occupied": true }], [{ "fish": 2, "occupied": false }, { "fish": 2, "occupied": false }]], "phase": "playing", "players": [{ "age": 1, "id": "p1", "penguinColor": "black", "penguins": [{ "x": 0, "y": 0 }, { "x": 3, "y": 1 }, { "x": 1, "y": 1, "tile": { "fish": 2, "occupied": false } }], "score": 8 }, { "age": 2, "id": "p2", "penguinColor": "brown", "penguins": [{ "x": 0, "y": 1 }, { "x": 4, "y": 2 }, { "x": 3, "y": 0 }], "score": 6 }, { "age": 3, "id": "p3", "penguinColor": "red", "penguins": [{ "x": 0, "y": 2 }, { "x": 4, "y": 0 }, { "x": 2, "y": 2 }], "score": 6 }], "turn": 10 } }, { "action": { "data": { "actionType": "move", "playerId": "p1", "origin": { "x": 2, "y": 1 }, "dst": { "x": 1, "y": 0, "tile": { "fish": 2, "occupied": false } } } }, "gs": { "board": [[{ "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "occupied": true, "fish": 2 }, { "fish": 2, "occupied": false }], [{ "fish": 2, "occupied": false }, "hole", { "fish": 0, "occupied": true }], [{ "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "fish": 0, "occupied": true }, { "fish": 2, "occupied": false }, { "fish": 0, "occupied": true }], [{ "fish": 2, "occupied": false }, { "fish": 2, "occupied": false }]], "phase": "playing", "players": [{ "age": 1, "id": "p1", "penguinColor": "black", "penguins": [{ "x": 0, "y": 0 }, { "x": 3, "y": 1 }, { "x": 1, "y": 0, "tile": { "fish": 2, "occupied": false } }], "score": 8 }, { "age": 2, "id": "p2", "penguinColor": "brown", "penguins": [{ "x": 0, "y": 1 }, { "x": 4, "y": 2 }, { "x": 3, "y": 0 }], "score": 6 }, { "age": 3, "id": "p3", "penguinColor": "red", "penguins": [{ "x": 0, "y": 2 }, { "x": 4, "y": 0 }, { "x": 2, "y": 2 }], "score": 6 }], "turn": 10 } }, { "action": { "data": { "actionType": "skipTurn", "playerId": "p1" } }, "gs": { "board": [[{ "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "fish": 2, "occupied": false }, { "fish": 2, "occupied": false }], [{ "fish": 2, "occupied": false }, { "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "fish": 0, "occupied": true }, { "fish": 0, "occupied": true }], [{ "fish": 0, "occupied": true }, { "fish": 2, "occupied": false }, { "fish": 0, "occupied": true }], [{ "fish": 2, "occupied": false }, { "fish": 2, "occupied": false }]], "phase": "playing", "players": [{ "age": 1, "id": "p1", "penguinColor": "black", "penguins": [{ "x": 0, "y": 0 }, { "x": 3, "y": 1 }, { "x": 2, "y": 1 }], "score": 6 }, { "age": 2, "id": "p2", "penguinColor": "brown", "penguins": [{ "x": 0, "y": 1 }, { "x": 4, "y": 2 }, { "x": 3, "y": 0 }], "score": 6 }, { "age": 3, "id": "p3", "penguinColor": "red", "penguins": [{ "x": 0, "y": 2 }, { "x": 4, "y": 0 }, { "x": 2, "y": 2 }], "score": 6 }], "turn": 10 } }]

            }

            expect(gameNode.action.data.actionType).to.equal("identity")
            expect(isDeepStrictEqual(expected.gs, gameNode.gs)).to.equal(true)
            expect(gameNode.children().length).to.equal(7)
            expect(isDeepStrictEqual(expected.children, gameNode.children))
        })
    })

    describe("#actions", () => {
        it("throws an error when invoking completeAction() with an invalid Action/GameNode combo", () => {
            const gameNode = createRootGameNode(getPlayingState())
            expect(()=>{completeAction(gameNode, { data: "foo", action: (gs:GameState)=>{return "bar"}})}).to.throw(GameStateActionError, "could not make the given move, it is not valid")
        })
        it("returns the correct gamenode when completeAction() is invoked with a valid Action/GameNode combo", () => {
            const gameNode = createRootGameNode(getPlayingState())
            const expected = {
                "board": [
                  [
                    "hole",
                    {
                      "fish": 0,
                      "occupied": true
                    },
                    {
                      "fish": 0,
                      "occupied": true
                    }
                  ],
                  [
                    {
                      "occupied": true,
                      "fish": 2
                    },
                    {
                      "fish": 2,
                      "occupied": false
                    }
                  ],
                  [
                    {
                      "fish": 2,
                      "occupied": false
                    },
                    {
                      "fish": 0,
                      "occupied": true
                    },
                    {
                      "fish": 0,
                      "occupied": true
                    }
                  ],
                  [
                    {
                      "fish": 0,
                      "occupied": true
                    },
                    {
                      "fish": 0,
                      "occupied": true
                    }
                  ],
                  [
                    {
                      "fish": 0,
                      "occupied": true
                    },
                    {
                      "fish": 2,
                      "occupied": false
                    },
                    {
                      "fish": 0,
                      "occupied": true
                    }
                  ],
                  [
                    {
                      "fish": 2,
                      "occupied": false
                    },
                    {
                      "fish": 2,
                      "occupied": false
                    }
                  ]
                ],
                "phase": "playing",
                "players": [
                  {
                    "age": 1,
                    "id": "p1",
                    "penguinColor": "black",
                    "penguins": [
                      {
                        "x": 1,
                        "y": 0,
                        "tile": {
                          "fish": 2,
                          "occupied": false
                        }
                      },
                      {
                        "x": 3,
                        "y": 1
                      },
                      {
                        "x": 2,
                        "y": 1
                      }
                    ],
                    "score": 8
                  },
                  {
                    "age": 2,
                    "id": "p2",
                    "penguinColor": "brown",
                    "penguins": [
                      {
                        "x": 0,
                        "y": 1
                      },
                      {
                        "x": 4,
                        "y": 2
                      },
                      {
                        "x": 3,
                        "y": 0
                      }
                    ],
                    "score": 6
                  },
                  {
                    "age": 3,
                    "id": "p3",
                    "penguinColor": "red",
                    "penguins": [
                      {
                        "x": 0,
                        "y": 2
                      },
                      {
                        "x": 4,
                        "y": 0
                      },
                      {
                        "x": 2,
                        "y": 2
                      }
                    ],
                    "score": 6
                  }
                ],
                "turn": 10
              }
            const actual = completeAction(gameNode, {
                "data": {
                  "actionType": "move",
                  "playerId": "p1",
                  "origin": {
                    "x": 0,
                    "y": 0
                  },
                  "dst": {
                    "x": 1,
                    "y": 0,
                    "tile": {
                      "fish": 2,
                      "occupied": false
                    }
                  }
                }
              })
            expect(isDeepStrictEqual(expected, actual.gs)).to.equal(true)
        })
        it("correctly applies a lambda action to all directly reachable GameStates when applyToAllFutureStates() is invoked", () => {
            expect(true).to.equal(false)
        })
    })
})
