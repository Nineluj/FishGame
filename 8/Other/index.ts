import { parseJsonObjectsFromStdIn } from "../../Fish/Common/src/harness/parseJson"
import { AIPlayer } from "../../Fish/Player/src/player/player"
import { colorOrder, Referee } from "../../Fish/Admin/src/referee/referee"
import { makeBoardFromTestInput } from "../../Fish/Common/src/harness/boardAdapter"

type GameDescription = {
    row: 2 | 3 | 4 | 5
    column: 2 | 3 | 4 | 5
    players: [string, number][]
    fish: 1 | 2 | 3 | 4 | 5
}

/**
 *
 */
const runTestCase = (input: GameDescription) => {
    const rows = input.row
    const cols = input.column
    const players = input.players
    const fish = input.fish

    const testCaseBoard = buildTestCaseBoard(rows, cols, fish)
    const board = makeBoardFromTestInput(testCaseBoard, [])
    const playerList = createPlayerList(players)

    const referee = new Referee(
        playerList,
        board,
        players.map((player) => player[0])
    )
    referee.runGamePlay()
    const winners = referee.getWinningPlayers()
    return winners.sort()
}

const createPlayerList = (players: [string, number][]) => {
    return players.map((player) => {
        return new AIPlayer(undefined, player[1])
    })
}

const buildTestCaseBoard = (rows: number, cols: number, fish: number) => {
    const buildBoard = []
    for (let r = 0; r < rows; r++) {
        const row = []
        for (let c = 0; c < cols; c++) {
            row.push(fish)
        }
        buildBoard.push(row)
    }
    return buildBoard
}

const main = () => {
    parseJsonObjectsFromStdIn((data: Array<any>) => {
        const output = runTestCase(data[0])
        console.log(JSON.stringify(output))
    })
}

main()
