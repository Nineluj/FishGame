import React from "react"
import { TileData } from "./utils"
import "./board.css"
import { ActualTile } from "@/models/tile"
import Tile from "../tile/tile"

interface Props {
    data: Array<TileData>
}

const makeFakeData = (x: number, y: number, numFish: number): TileData => {
    return {
        x,
        y,
        tile: { fish: numFish },
    }
}

const Board: React.FC<Props> = ({ data }) => {
    const fakeData = [
        makeFakeData(0, 0, 3),
        makeFakeData(0, 1, 2),
        makeFakeData(0, 2, 1),
        makeFakeData(1, 0, 1),
        makeFakeData(1, 1, 2),
        makeFakeData(1, 2, 4),
        makeFakeData(2, 0, 5),
        makeFakeData(2, 1, 0),
    ]

    const row1 = [
        makeFakeData(0, 0, 3),
        makeFakeData(0, 1, 2),
        makeFakeData(0, 2, 1),
    ]
    const row2 = [
        makeFakeData(1, 0, 1),
        makeFakeData(1, 1, 2),
        makeFakeData(1, 2, 4),
    ]
    const row3 = [makeFakeData(2, 0, 5), makeFakeData(2, 1, 0)]

    const columns = [row1, row2, row3]
    return (
        <div className="container">
            {columns.map((column) => (
                <div className="column">
                    {column.map((tile) => (
                        <Tile
                            fish={(tile.tile as ActualTile).fish}
                            className="tile"
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export { Board }
