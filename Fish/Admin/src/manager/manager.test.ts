import { AIPlayer } from "../../../Player/src/player/player"
import { createCompetitorArray } from "../../../Common/src/models/testHelpers"
import { Competitor, TournamentManager } from "./manager"
import { expect } from "chai"
import { isDeepStrictEqual } from "util"
import { ErrorPlayer } from "src/referee/referee.test"

class WinningErrorPlayer extends AIPlayer {
    notifyTournamentOver(didIWin: boolean) {
        throw new Error("I dont know how to handle victory")
    }
}

describe("Tournament Manager", () => {
    describe("#constructor", () => {})
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
        it("Splits 15 players into 4 4 3 2 2 groups each sorted by age", () => {
            const lengthArray = [4, 4, 3, 2, 2]
            const competitors = createCompetitorArray(15)
            const splitPlayers = TournamentManager.splitPlayersIntoGames(
                competitors
            )

            expect(splitPlayers).to.have.lengthOf(5)
            splitPlayers.forEach((group, index) => {
                expect(group).to.have.lengthOf(lengthArray[index])
                expect(isCompetitorArraySorted(group)).to.be.true
            })
        })
        it("Splits 5 players into 2, 3 groups each sorted by age", () => {
            const competitors = createCompetitorArray(5)
            const splitPlayers = TournamentManager.splitPlayersIntoGames(
                competitors
            )

            expect(splitPlayers).to.have.lengthOf(2)
            expect(splitPlayers[0]).to.have.lengthOf(2)
            expect(splitPlayers[1]).to.have.lengthOf(3)
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

    describe("#runTournament", () => {
        it("puts a failing player into the losers array", () => {
            const competitors = createCompetitorArray(6).concat([
                { id: "bad", age: 2, ai: new ErrorPlayer() },
            ])

            const manager = new TournamentManager(competitors)
            manager.runTournament()

            expect(manager.getLosers()).to.contain("bad")
        })
        it("produces at least one winner", () => {
            const competitors = createCompetitorArray(8)

            const manager = new TournamentManager(competitors)
            const result = manager.runTournament()
            expect(result).to.have.lengthOf.greaterThan(0)
        })
        it("if the winner errors after winning, the winner is added to the losers array", () => {
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
            expect(manager.getLosers()).to.contain("8")
        })
    })

    describe("#runGameForEachGroup", () => {
        it("at least one player make it to the next round given rule abiding players", () => {})

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
            expect(manager.getLosers()).to.have.lengthOf(4)
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
            expect(manager.getLosers()).to.contain("bad")
        })
    })

    // TODO: need some tests with naughty player AIs
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
