import { AIPlayer } from "../../../Player/src/player/player"
import { createCompetitorArray } from "../../../Common/src/models/testHelpers"
import { Competitor, TournamentManager } from "./manager"
import { expect } from "chai"
import { isDeepStrictEqual } from "util"
import { ErrorPlayer, IllegalActionPlayer } from "src/referee/referee.test"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"

class WinningErrorPlayer extends AIPlayer {
    notifyTournamentOver(didIWin: boolean) {
        throw new Error("I dont know how to handle victory")
    }
}

class PlayerErrorsAsTournamentStarts extends AIPlayer {
    notifyTournamentIsStarting() {
        throw new Error("I cant handle competing")
    }
}
class PlayerRecordsTournamentUpdates extends AIPlayer {
    notifyTournamentIsStarting() {
        this.output.write("Tournament Is Starting")
    }

    notifyTournamentOver(didIWin: boolean) {
        this.output.write(`I ${didIWin ? "won" : "lost"}`)
    }
}

class ErrorPlayerRecordsTournamentUpdates extends ErrorPlayer {
    notifyTournamentIsStarting() {
        this.output.write("Tournament Is Starting")
    }

    notifyTournamentOver(didIWin: boolean) {
        this.output.write(`I ${didIWin ? "won" : "lost"}`)
    }
}

describe("Tournament Manager", () => {
    describe("#constructor", () => {
        it("errors if not enough players are given", () => {
            expect(() => new TournamentManager([])).to.throw(
                IllegalArgumentError,
                "Must have at least 2 players to run a tournament"
            )

            expect(
                () => new TournamentManager(createCompetitorArray(1))
            ).to.throw(
                IllegalArgumentError,
                "Must have at least 2 players to run a tournament"
            )
        })
    })
    describe("#splitPlayersIntoGames", () => {
        it("Splits 16 players into 4 groups each sorted by age", () => {
            const competitors = createCompetitorArray(16)

            const splitPlayers = TournamentManager.splitPlayersIntoGames(
                competitors
            )

            expect(splitPlayers).to.have.lengthOf(4)
            splitPlayers.forEach((group) => {
                expect(group).to.have.lengthOf(4)
                expect(isCompetitorArraySorted(group)).to.be.true
            })
        })
        it("Splits 3 players into 1 group sorted by age", () => {
            const competitors = createCompetitorArray(3)

            const splitPlayers = TournamentManager.splitPlayersIntoGames(
                competitors
            )

            expect(splitPlayers).to.have.lengthOf(1)
            expect(splitPlayers[0]).to.have.lengthOf(3)
            expect(isCompetitorArraySorted(splitPlayers[0])).to.be.true
        })
        it("Splits 15 players into 4 4 4 3 groups each sorted by age", () => {
            const lengthArray = [4, 4, 4, 3]
            const competitors = createCompetitorArray(15)
            const splitPlayers = TournamentManager.splitPlayersIntoGames(
                competitors
            )

            expect(splitPlayers).to.have.lengthOf(4)
            splitPlayers.forEach((group, index) => {
                expect(group).to.have.lengthOf(lengthArray[index])
                expect(isCompetitorArraySorted(group)).to.be.true
            })
        })
        it("Splits 5 players into 3, 2 groups each sorted by age", () => {
            const competitors = createCompetitorArray(5)
            const splitPlayers = TournamentManager.splitPlayersIntoGames(
                competitors
            )

            expect(splitPlayers).to.have.lengthOf(2)
            expect(splitPlayers[0]).to.have.lengthOf(3)
            expect(splitPlayers[1]).to.have.lengthOf(2)
        })
        it("Splits an unsorted array of 6 elements, into 2 groups of 3 each sorted by age", () => {
            const competitors = createCompetitorArray(6)
            const shuffleCompetitors = [
                competitors[2],
                competitors[3],
                competitors[5],
                competitors[0],
                competitors[1],
                competitors[4],
            ]
            const splitPlayers = TournamentManager.splitPlayersIntoGames(
                shuffleCompetitors
            )

            expect(splitPlayers).to.have.lengthOf(2)
            const lengths = [4, 2]
            splitPlayers.forEach((group, index) => {
                expect(group).to.have.lengthOf(lengths[index])
                expect(isCompetitorArraySorted(group)).to.be.true
            })
        })
        it("Splits 17 players into 4 4 4 3 2 groups each sorted by age", () => {
            const lengthArray = [4, 4, 4, 3, 2]
            const competitors = createCompetitorArray(17)
            const splitPlayers = TournamentManager.splitPlayersIntoGames(
                competitors
            )

            expect(splitPlayers).to.have.lengthOf(5)
            splitPlayers.forEach((group, index) => {
                expect(group).to.have.lengthOf(lengthArray[index])
                expect(isCompetitorArraySorted(group)).to.be.true
            })
        })
    })

    describe("#runRefereeGames", () => {
        it("creates a referee for each group", () => {
            const competitors = createCompetitorArray(5)
            const groups = TournamentManager.splitPlayersIntoGames(competitors)

            const manager = new TournamentManager(competitors)
            const refGroups = manager.runRefereeGames(groups)

            refGroups.forEach((rg, index) => {
                expect(isDeepStrictEqual(rg[1], groups[index])).to.be.true
                rg[0]
                    .getPlayerStatuses()
                    .players.forEach((p) =>
                        expect(isIdInCompetitorArray(groups[index], p.id))
                    )
            })
        })
    })

    describe("#collectResults", () => {
        it("Returns the winners of each game with all rule abiding players", () => {
            const competitors = createCompetitorArray(5)
            const groups = TournamentManager.splitPlayersIntoGames(competitors)

            const manager = new TournamentManager(competitors)
            const refGroups = manager.runRefereeGames(groups)
            const results = manager.collectResults(refGroups)

            expect(results.length).to.be.greaterThan(0)
            expect(manager.getLosers()).to.have.lengthOf.greaterThan(0)
            expect(results.length + manager.getLosers().length).to.be.equal(5)
        })
    })

    describe("#runTournament", () => {
        it("puts a failing player into the failures array", () => {
            const competitors = createCompetitorArray(6).concat([
                { id: "bad", age: 2, ai: new ErrorPlayer() },
            ])

            const manager = new TournamentManager(competitors)
            const result = manager.runTournament()

            expect(manager.getFailures()).to.contain("bad")
            expect(manager.getLosers()).to.not.contain("bad")
            expect(manager.getLosers().length + result.length).to.be.equal(6)
        })
        it("produces at least one winner", () => {
            const competitors = createCompetitorArray(8)

            const manager = new TournamentManager(competitors)
            const result = manager.runTournament()
            expect(result).to.have.lengthOf.greaterThan(0)
            expect(result.length + manager.getLosers().length).to.equal(8)
        })
        it("if the winner errors after winning, the winner is added to the failures array", () => {
            const competitors = [
                { id: "1", age: 10, ai: new ErrorPlayer() },
                { id: "2", age: 10, ai: new ErrorPlayer() },
                { id: "3", age: 10, ai: new ErrorPlayer() },
                { id: "4", age: 10, ai: new ErrorPlayer() },
                { id: "5", age: 10, ai: new ErrorPlayer() },
                { id: "6", age: 10, ai: new ErrorPlayer() },
                { id: "7", age: 10, ai: new ErrorPlayer() },
                { id: "8", age: 10, ai: new WinningErrorPlayer() },
            ]

            const manager = new TournamentManager(competitors)
            const result = manager.runTournament()
            expect(result).to.have.lengthOf(0)
            expect(manager.getFailures()).to.contain("8")
        })
        it("if all players error as they are alerted the game is beginning, they are added to the failures", () => {
            const competitors = [
                { id: "1", age: 10, ai: new PlayerErrorsAsTournamentStarts() },
                { id: "2", age: 10, ai: new PlayerErrorsAsTournamentStarts() },
                { id: "3", age: 10, ai: new PlayerErrorsAsTournamentStarts() },
                { id: "4", age: 10, ai: new PlayerErrorsAsTournamentStarts() },
                { id: "5", age: 10, ai: new PlayerErrorsAsTournamentStarts() },
                { id: "6", age: 10, ai: new PlayerErrorsAsTournamentStarts() },
                { id: "7", age: 10, ai: new PlayerErrorsAsTournamentStarts() },
                { id: "8", age: 10, ai: new PlayerErrorsAsTournamentStarts() },
            ]

            const manager = new TournamentManager(competitors)
            const result = manager.runTournament()
            expect(result).to.have.lengthOf(0)
            expect(manager.getFailures()).to.have.lengthOf(8)
        })
    })

    describe("#runGameForEachGroup", () => {
        it("at least one player makes it to the next round given rule abiding players", () => {
            const competitors = createCompetitorArray(12)
            const groups = [
                [
                    competitors[0],
                    competitors[1],
                    competitors[2],
                    competitors[3],
                ],
                [
                    competitors[4],
                    competitors[5],
                    competitors[6],
                    competitors[7],
                ],
                [
                    competitors[8],
                    competitors[9],
                    competitors[10],
                    competitors[11],
                ],
            ]

            const manager = new TournamentManager(competitors)
            const result = manager.runGameForEachGroup(groups)
            expect(result).to.have.length.greaterThan(2) // each group should produce at least one winner
        })

        it("no players make it to the next round if they are all bad", () => {
            const cs = [
                { id: "bad1", age: 1, ai: new ErrorPlayer() },
                { id: "bad2", age: 2, ai: new ErrorPlayer() },
                { id: "bad3", age: 3, ai: new ErrorPlayer() },
                { id: "bad4", age: 4, ai: new ErrorPlayer() },
            ]

            const groups = [
                [cs[0], cs[1]],
                [cs[2], cs[3]],
            ]

            const manager = new TournamentManager(cs)
            const result = manager.runGameForEachGroup(groups)

            expect(result).to.have.lengthOf(0)
            expect(manager.getFailures()).to.have.lengthOf(4)
        })

        it("bad player doesn't make it to the second round", () => {
            const cs = createCompetitorArray(6).concat([
                { id: "bad", age: 2, ai: new ErrorPlayer() },
            ])

            const groups = [
                [cs[0], cs[1], cs[2]],
                [cs[3], cs[4], cs[5], cs[6]],
            ]

            const manager = new TournamentManager(cs)
            const result = manager.runGameForEachGroup(groups)

            expect(isIdInCompetitorArray(result, "bad")).to.be.false
            expect(manager.getFailures()).to.contain("bad")
        })
    })

    describe("#alertPlayersThatTournamentIsBeginning", () => {
        it("alerts players that the tournament is beginning", () => {
            let data = { written: "" }
            const customWriter = {
                write(s: string): void {
                    data.written = s
                },
            }

            const recordPlayer = new PlayerRecordsTournamentUpdates(
                customWriter
            )

            const normalPlayer = new AIPlayer()

            const tm = new TournamentManager([
                { id: "recorder", age: 1, ai: recordPlayer },
                { id: "normy", age: 1, ai: normalPlayer },
            ])

            tm.alertPlayersThatTournamentIsBeginning()
            expect(data.written).to.be.equal("Tournament Is Starting")
        })
        it("makes players that error losers", () => {
            let data = { written: "" }
            const customWriter = {
                write(s: string): void {
                    data.written = s
                },
            }

            const recordPlayer = new PlayerRecordsTournamentUpdates(
                customWriter
            )

            const normalPlayer = new AIPlayer()

            const tm = new TournamentManager([
                { id: "recorder", age: 1, ai: recordPlayer },
                { id: "normy", age: 1, ai: normalPlayer },
                {
                    id: "error",
                    age: 1000,
                    ai: new PlayerErrorsAsTournamentStarts(),
                },
            ])

            tm.alertPlayersThatTournamentIsBeginning()
            expect(data.written).to.be.equal("Tournament Is Starting")
            expect(tm.getFailures()).to.have.lengthOf(1)
        })
    })

    describe("#alertPlayersOfVictory", () => {
        it("alerts players that the tournament is over and they won", () => {
            let data = { written: "" }
            const customWriter = {
                write(s: string): void {
                    data.written = s
                },
            }

            const recordPlayer = new PlayerRecordsTournamentUpdates(
                customWriter
            )

            const normalPlayer = new AIPlayer()

            const tm = new TournamentManager([
                { id: "recorder", age: 1, ai: recordPlayer },
                { id: "normy", age: 1, ai: normalPlayer },
            ])

            tm.alertPlayersOfVictory()
            expect(data.written).to.be.equal("I won")
        })
        it("makes players that error failures", () => {
            let data = { written: "" }
            const customWriter = {
                write(s: string): void {
                    data.written = s
                },
            }

            const recordPlayer = new PlayerRecordsTournamentUpdates(
                customWriter
            )

            const normalPlayer = new AIPlayer()

            const tm = new TournamentManager([
                { id: "recorder", age: 1, ai: recordPlayer },
                { id: "normy", age: 1, ai: normalPlayer },
                {
                    id: "error",
                    age: 1000,
                    ai: new WinningErrorPlayer(),
                },
            ])

            expect(tm.getLosers()).to.have.lengthOf(0)
            tm.alertPlayersOfVictory()
            expect(data.written).to.be.equal("I won")
            expect(tm.getFailures()).to.have.lengthOf(1)
        })
    })

    describe("#alertPlayersOfLoss", () => {
        it("alerts players that the tournament is over and they lost", () => {
            let data = { written: [] as string[] }
            const customWriter = {
                write(s: string): void {
                    data.written.push(s)
                },
            }

            const recordPlayer1 = new PlayerRecordsTournamentUpdates(
                customWriter
            )

            const recordPlayer2 = new PlayerRecordsTournamentUpdates(
                customWriter
            )

            const recordPlayer3 = new PlayerRecordsTournamentUpdates(
                customWriter
            )

            const recordPlayer4 = new PlayerRecordsTournamentUpdates(
                customWriter
            )

            const comps = [
                { id: "rec1", age: 6, ai: recordPlayer1 },
                { id: "rec2", age: 6, ai: recordPlayer2 },
                { id: "rec3", age: 6, ai: recordPlayer3 },
                { id: "rec4", age: 3, ai: recordPlayer4 },
                { id: "rec5", age: 6, ai: recordPlayer1 },
                { id: "rec6", age: 6, ai: recordPlayer2 },
                { id: "rec7", age: 6, ai: recordPlayer3 },
            ]

            const tm = new TournamentManager(comps)

            tm.runOneRound(comps)

            tm.alertPlayersOfLoss()

            expect(data.written.length).to.be.greaterThan(0)
            expect(data.written[0]).to.be.equal("I lost")
        })
        it("does not update error players on their loss", () => {
            let data = { written: "" }
            const customWriter = {
                write(s: string): void {
                    data.written = s
                },
            }

            const recordPlayer = new ErrorPlayerRecordsTournamentUpdates(
                customWriter
            )

            const competitors = createCompetitorArray(5).concat([
                { id: "rec", age: 1, ai: recordPlayer },
            ])
            const tm = new TournamentManager(competitors)

            tm.runOneRound(competitors)
            tm.alertPlayersOfLoss()

            expect(data.written).to.be.equal("")
            expect(tm.getFailures()).to.have.lengthOf(1)
        })
    })
    describe("#canRunAnotherRound", () => {
        it("Returns false, if the last round players and next round players are the same", () => {
            const competitors = createCompetitorArray(10)
            const tm = new TournamentManager(competitors)

            expect(tm.canRunAnotherRound(competitors, competitors)).to.be.false
        })
        it("Returns false, if there aren't enough players to continue", () => {
            const competitors = createCompetitorArray(10)
            const tm = new TournamentManager(competitors)

            expect(tm.canRunAnotherRound(competitors.slice(9), competitors)).to
                .be.false
        })
        it("Returns true, another round can be played", () => {
            const competitors = createCompetitorArray(10)
            const tm = new TournamentManager(competitors)

            expect(tm.canRunAnotherRound(competitors.slice(5), competitors)).to
                .be.true
        })
    })
    describe("#runOneRound", () => {
        it("only returns players that win their rounds", () => {
            const competitors = createCompetitorArray(15)
            const tm = new TournamentManager(competitors)
            const result = tm.runOneRound(competitors)
            const firstSetLosers = tm.getLosers()

            expect(result).to.have.lengthOf.greaterThan(4) // there are 5 games in a 15 round
            expect(firstSetLosers).to.have.lengthOf.greaterThan(0)

            const result2 = tm.runOneRound(result)

            expect(result2).to.have.lengthOf.lessThan(result.length)
            expect(result2).to.have.lengthOf.greaterThan(0)
            expect(tm.getLosers()).to.have.lengthOf.greaterThan(
                firstSetLosers.length
            )
        })

        it("adds players to the failures section that error", () => {
            const competitors = createCompetitorArray(15).concat([
                { id: "error dude", age: 10, ai: new ErrorPlayer() },
                { id: "illegal dude", age: 10, ai: new IllegalActionPlayer() },
            ])
            const tm = new TournamentManager(competitors)
            const result = tm.runOneRound(competitors)
            const firstSetLosers = tm.getLosers()

            expect(result).to.have.lengthOf.greaterThan(4) // there are 5 games in a 15 round
            expect(firstSetLosers).to.have.lengthOf.greaterThan(0)
            expect(tm.getFailures()).to.have.lengthOf(2)
            expect(tm.getFailures()).to.contain("error dude")
            expect(tm.getFailures()).to.contain("illegal dude")

            const result2 = tm.runOneRound(result)

            expect(result2).to.have.lengthOf.lessThan(result.length)
            expect(result2).to.have.lengthOf.greaterThan(0)
            expect(tm.getLosers()).to.have.lengthOf.greaterThan(
                firstSetLosers.length
            )
            expect(tm.getFailures()).to.have.lengthOf(2)
            expect(tm.getFailures()).to.contain("error dude")
            expect(tm.getFailures()).to.contain("illegal dude")
        })
    })
})

const isCompetitorArraySorted = (competitors: Competitor[]) => {
    for (let i = 1; i < competitors.length; i++) {
        const firstCompetitor = competitors[i - 1]
        const nextCompetitor = competitors[i]
        if (firstCompetitor.age > nextCompetitor.age) {
            return false
        }
    }
    return true
}

const isIdInCompetitorArray = (
    competitors: Competitor[],
    id: string
): boolean => competitors.some((comp) => comp.id === id)
