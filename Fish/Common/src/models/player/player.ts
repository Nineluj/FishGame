import { Point } from "../point"

export type PenguinColor = "red" | "white" | "brown" | "black"

/**
 * Represents a Player that is playing in a game of Fish
 */
interface Player {
    id: string
    penguinColor: PenguinColor
    penguins: Array<Point>
    score: number
}

/**
 * Changes the position of the player's penguin at origin to be at dst
 * The player must have a penguin at the origin position. The resulting
 * player will have their penguins in the original order.
 * @param p The player for which the penguin should be moved
 * @param origin The old position of the penguin
 * @param dst The new position of the penguin
 */
const changePenguinPosition = (
    p: Player,
    origin: Point,
    dst: Point
): Player => {
    return {
        ...p,
        penguins: p.penguins.map((penguinPos) => {
            if (penguinPos.x === origin.x && penguinPos.y === origin.y) {
                return dst
            }
            return penguinPos
        }),
    }
}

/**
 * Get a new player that includes a penguin at the given position
 * @param p Base player
 * @param dst Location of new penguin
 */
const putPenguin = (p: Player, dst: Point): Player => {
    return {
        ...p,
        penguins: [...p.penguins, dst],
    }
}

export { Player, changePenguinPosition, putPenguin }
