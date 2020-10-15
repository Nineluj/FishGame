import { Board, boardSet } from "../board"

/**
 * Creates a board with tiles at all the given positions. Used for testing.
 * @param tileLocations
 */
const makeBoardWithTiles = (tileLocations: Array<[number, number]>): Board => {
    if (tileLocations.length === 0) {
        return [[]]
    }

    return boardSet(
        makeBoardWithTiles(tileLocations.slice(1)),
        { x: tileLocations[0][0], y: tileLocations[0][1] },
        { fish: 2, occupied: false }
    )
}

export { makeBoardWithTiles }
