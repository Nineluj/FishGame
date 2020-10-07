import React from "react"
import fishSvg from "@assets/fish.svg"
import "./tile.css"

interface Props {
    className?: string
    fish: number
    clickHandler?: (event: any) => void
}

const size = 50

/**
 * Draws a single hexagon
 * @param size Size of the sides of the hexagon in pixels
 * @param clickHandler Callback function for when the hexagon is clicked
 */
const Tile: React.FC<Props> = ({ className, fish, clickHandler }) => {
    let fishSprites: Array<any> = []
    for (let i = 0; i < fish; i++) {
        fishSprites.push(<img alt="Icon for a fish" src={fishSvg} />)
    }

    return (
        <div
            className={className}
            style={{
                height: size * 2,
                width: size * 3,
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
                    onClick={clickHandler}
                    points="0,1 1,2 2,2 3,1 2,0 1,0 0,1"
                    fill="orange"
                />
            </svg>
            <div className="fishy" style={{ position: "relative" }}>
                {fishSprites}
            </div>
        </div>
    )
}

export default Tile
