/* Point denotes a position on a board */
type Point = { x: number; y: number }

/**
 * Does the array contain the given position?
 * @param arr Array to search
 * @param needle Position to find
 */
const containsPoint = (arr: Array<Point>, needle: Point): boolean =>
    arr.some((p) => p.x === needle.x && p.y === needle.y)

export { Point, containsPoint }
