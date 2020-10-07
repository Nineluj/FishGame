import React from "react"

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
    const Fishies: React.FC = () => {
        const fishSprites = []
        for (let i = 0; i < fish; i++) {
            fishSprites.push(
                <g
                    transform="translate(0.000000,640.000000) scale(0.100000,-0.100000)"
                    fill="#000000"
                    stroke="none"
                >
                    <path d="M6455 5500 c-26 -10 -51 -39 -60 -68 -5 -17 0 -32 19 -57 45 -58 24 -101 -30 -60 -31 23 -62 18 -78 -13 -8 -16 -40 -50 -70 -76 -45 -38 -58 -57 -68 -94 -10 -39 -28 -62 -130 -162 -65 -63 -118 -123 -118 -133 0 -10 19 -29 45 -45 78 -47 50 -75 -36 -36 -68 32 -90 26 -120 -33 -36 -70 -116 -151 -216 -218 -119 -80 -143 -103 -143 -136 0 -14 -7 -32 -15 -39 -8 -7 -15 -18 -15 -25 0 -18 84 -52 200 -80 58 -14 154 -38 213 -54 l108 -28 -78 -16 c-153 -32 -302 -57 -638 -107 -187 -28 -477 -73 -645 -100 -168 -27 -402 -60 -520 -74 -118 -15 -289 -38 -380 -52 -187 -30 -225 -27 -367 25 -116 42 -311 98 -369 105 -57 7 -171 -13 -226 -40 -38 -17 -68 -60 -73 -100 -4 -37 34 -60 138 -84 93 -21 167 -47 167 -60 0 -11 -299 -31 -472 -31 -185 0 -299 15 -494 65 -147 37 -224 74 -394 191 -58 40 -169 108 -245 151 -328 183 -587 285 -879 345 -172 35 -246 37 -287 8 -29 -20 -29 -22 -29 -112 1 -51 1 -172 1 -270 1 -194 7 -226 53 -256 l27 -18 -34 -20 c-50 -30 -55 -77 -18 -152 15 -31 39 -96 52 -144 21 -77 28 -91 57 -109 36 -22 39 -34 16 -59 -14 -16 -14 -20 0 -48 29 -56 21 -140 -29 -283 -25 -71 -45 -136 -45 -143 0 -8 21 -28 46 -46 l46 -32 -68 -23 c-38 -13 -70 -24 -70 -24 -10 -1 -57 -152 -78 -245 -15 -66 -34 -151 -43 -190 -8 -38 -26 -91 -39 -117 -14 -27 -21 -48 -17 -49 78 -5 311 6 463 22 166 17 226 29 400 76 113 30 301 88 418 129 117 41 313 104 435 140 122 36 249 75 282 86 201 69 809 46 1038 -39 l79 -29 -59 -26 c-69 -31 -146 -48 -212 -48 -76 0 -77 -3 -80 -235 -2 -233 8 -299 74 -505 24 -74 47 -152 50 -172 4 -21 13 -43 21 -49 9 -7 12 -20 8 -31 -4 -14 1 -24 15 -34 12 -9 21 -21 21 -29 0 -21 63 -55 106 -56 65 -3 97 9 361 127 276 123 560 270 748 384 166 102 369 207 424 219 25 6 93 13 151 16 157 9 714 -45 1304 -128 l159 -23 -36 -24 c-51 -35 -60 -60 -66 -190 -6 -108 -7 -115 -27 -118 -20 -3 -22 -10 -26 -95 -3 -65 -13 -114 -31 -168 -36 -102 -38 -220 -4 -269 12 -19 36 -42 54 -53 30 -17 33 -17 65 -1 77 39 214 149 378 302 96 91 190 180 208 198 l33 34 24 -27 c13 -16 25 -33 25 -40 0 -6 12 -25 26 -42 52 -62 98 -40 203 99 23 30 60 78 82 105 22 28 54 81 71 118 29 64 33 68 57 62 14 -4 193 -9 396 -12 410 -6 609 6 1120 68 221 27 592 82 636 95 14 4 17 -20 21 -224 6 -246 6 -248 67 -314 29 -32 61 -35 107 -10 69 38 297 305 476 558 58 82 112 155 119 161 8 6 147 41 309 77 162 37 349 82 415 101 130 36 321 75 372 75 45 0 829 201 1015 260 117 38 184 66 266 113 176 101 247 177 223 240 -17 45 -50 53 -139 33 -63 -15 -85 -16 -120 -7 -23 7 -40 16 -37 21 4 6 10 10 16 10 22 0 202 93 234 121 29 26 35 38 35 70 0 56 -19 96 -79 161 -79 87 -282 212 -502 309 -140 62 -574 209 -617 209 -18 0 -96 23 -174 51 -183 66 -246 83 -394 108 -67 11 -168 32 -225 45 -464 112 -633 150 -759 171 -214 35 -629 93 -757 105 -222 20 -632 40 -840 40 -149 0 -267 6 -394 21 -100 11 -193 18 -206 15 -18 -5 -23 -2 -23 12 0 20 -38 58 -120 119 -30 22 -174 156 -320 298 -361 350 -559 515 -754 629 -99 58 -130 69 -161 56z" />
                </g>
            )
        }

        return <>{...fishSprites}</>
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
                // style={{ position: "absolute" }}
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                viewBox="0 0 3 2"
            >
                <polygon
                    onClick={clickHandler}
                    points="0,1 1,2 2,2 3,1 2,0 1,0 0,1"
                    fill="orange"
                >
                    <Fishies></Fishies>
                </polygon>
            </svg>
        </div>
    )
}

export default Tile
