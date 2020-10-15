import React from "react"
import fishSvg from "@assets/fish.svg"
import penguinSvg from "@assets/penguin.svg"
import "./tile.css"

interface Props {
    className?: string
    fish: number
    hole: boolean
    onTileClick?: (event: any) => void
    onPenguinClick?: (event: any) => void
    penguinColor?: string
}

const TILE_SIZE = 50

/**
 * Draws a Tile
 * @param className The styling class that the component should use for drawing
 * @param fish The number of fish to show on top of the tile, currently limited to 5
 * @param clickHandler Function that will get called when the tile is clicked
 */
const Tile: React.FC<Props> = ({
    className,
    fish,
    hole,
    onTileClick,
    onPenguinClick,
    penguinColor,
}) => {
    if (hole) {
        return (
            <div
                className={className}
                style={{
                    height: TILE_SIZE * 2,
                    width: TILE_SIZE * 3,
                }}
            />
        )
    }
    let fishSprites: Array<any> = []
    for (let i = 0; i < fish; i++) {
        fishSprites.push(
            // clickHandler also passed here since the fish are rendered on top of
            // the hexagons and might therefore be clicked
            <img alt="Icon for a fish" onClick={onTileClick} src={fishSvg} />
        )
    }

    return (
        <div
            className={className}
            style={{
                height: TILE_SIZE * 2,
                width: TILE_SIZE * 3,
            }}
        >
            <svg
                style={{ position: "relative" }}
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                viewBox="0 0 3 2"
            >
                <polygon
                    onClick={onTileClick}
                    points="0,1 1,2 2,2 3,1 2,0 1,0 0,1"
                    fill="orange"
                />
            </svg>
            <div className="fishy" style={{ position: "relative" }}>
                {fishSprites}
            </div>
            {penguinColor && (
                <div className="penguin" style={{ position: "relative" }}>
                    <img
                        alt="Icon for a penguin"
                        onClick={onPenguinClick}
                        src={penguinSvg}
                    />
                </div>
            )}
        </div>
    )
}

export default Tile
