import * as React from "react"

interface HexagonProps {
    size: number
    clickHandler: (event: any) => void
}

const Hexagon: React.FC<HexagonProps> = ({ size, clickHandler }) => {
    return (
        <div
            style={{
                height: size * 2,
                width: size * 3,
                position: "absolute",
            }}
        >
            <svg
                style={{ position: "absolute" }}
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                viewBox="0 0 3 2"
            >
                <polygon
                    onClick={clickHandler}
                    points="0,1 1,2 2,2 3,1 2,0 1,0 0,1"
                    fill="red"
                />
            </svg>
        </div>
    )
}

export default Hexagon
