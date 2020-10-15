import { Point } from "@models/point"

type PenguinColor = "red" | "white" | "brown" | "black"

/**
 * Represents a Player that is playing in a game of Fish
 */
interface Player {
    age: number
    id: string
    penguinColor: PenguinColor
    penguins: Array<Point>
    score: number
}

/**
 * Changes the position of the player's penguin at origin to be at dst
 * The player must have a penguin at the origin position
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
 * Returns a copy of the list that is sorted in age order ascending
 * @param players list of players to sort
 */
const sortPlayersByAgeAsc = (players: Array<Player>): Array<Player> => {
    return [...players].sort((a, b) => {
        return a.age - b.age
    })
}

export { Player, sortPlayersByAgeAsc, changePenguinPosition }
