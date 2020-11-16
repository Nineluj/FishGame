import { AIPlayer } from "../../../Player/src/player/player"
import { createCompetitorArray } from "../../../Common/src/models/testHelpers"
import { Competitor, TournamentManager } from "./manager"
import { expect } from "chai"

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
