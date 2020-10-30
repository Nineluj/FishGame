/* Point denotes a position on a board */
type Point = { x: number; y: number }

/**
 * Does the array contain the given position?
 * @param arr Array to search
 * @param needle Position to find
 */
const containsPoint = (arr: Array<Point>, needle: Point): boolean =>
    arr.some((p) => p.x === needle.x && p.y === needle.y)

const pointsEqual = (p1: Point, p2: Point): boolean => {
    return p1.x === p2.x && p1.y === p2.y
}

export { Point, containsPoint, pointsEqual }
