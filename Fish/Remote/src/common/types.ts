import { PenguinColor } from "../../../Common/src/models/player"

type ExternalColor = PenguinColor

type ExternalPosition = [number, number]

/**
 * Tries to convert the given argument into an external position, if it fails
 * returns false
 */
export const externalPositionFromAny = (arg: any): ExternalPosition | false => {
    if (
        Array.isArray(arg) &&
        arg.length === 2 &&
        Number.isInteger(arg[0]) &&
        Number.isInteger(arg[1]) &&
        arg[0] >= 0 &&
        arg[1] >= 0
    ) {
        return [arg[0], arg[1]]
    }

    return false
}

/**
 * Tries to convert the given argument into an external action, if it fails
 * returns false
 */
export const externalActionFromAny = (arg: any): ExternalAction => {
    if (Array.isArray(arg) && arg.length === 2) {
        const p1 = externalPositionFromAny(arg[0])
        const p2 = externalPositionFromAny(arg[1])

        if (!!p1 && !!p2) {
            return [p1, p2]
        }
    }

    return false
}

type ExternalAction = false | [ExternalPosition, ExternalPosition]

interface ExternalPlayer {
    color: ExternalColor
    score: number
    places: Array<ExternalPosition>
}

interface ExternalState {
    players: Array<ExternalPlayer>
    board: Array<Array<number>>
}

export {
    ExternalColor,
    ExternalPosition,
    ExternalAction,
    ExternalPlayer,
    ExternalState,
}
