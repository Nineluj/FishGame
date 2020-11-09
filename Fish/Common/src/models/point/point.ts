/**
 * Point denotes a position on a board
 *
 * Coordinate system based on the 3rd model (“odd-q” vertical layout shoves odd columns down) from:
 * https://www.redblobgames.com/grids/hexagons/#coordinates-offset
 *
 * Where x is the first number in the coordinate, and y is the second
 */
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
