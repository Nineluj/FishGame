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
 * Returns a copy of the list that is sorted in age order ascending
 * @param players list of players to sort
 */
const sortPlayersByAgeAsc = (players: Array<Player>): Array<Player> => {
    return [...players].sort((a, b) => {
        return a.age - b.age
    })
}

export { Player, sortPlayersByAgeAsc }
