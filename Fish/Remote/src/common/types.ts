import { PenguinColor } from "../../../Common/src/models/player"

/* Types for messages sent between the server and the client */
type Message = [string, Array<any>]
type StartMessage = ["start", [boolean]]
type PlayingAsMessage = ["playing-as", [ExternalColor]]
type PlayingWithMessage = ["playing-with", [Array<ExternalColor>]]
type SetupMessage = ["setup", [ExternalState]]
type TakeTurnMessage = ["take-turn", [ExternalState, Array<ExternalAction>]]
type EndMessage = ["end", [boolean]]

/* JSON serializable representations for the data related to the game */
type ExternalColor = PenguinColor
type ExternalPosition = [number, number]
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

/**
 * Tries to convert the given argument into an external position, if it fails
 * returns false
 */
const externalPositionFromAny = (arg: any): ExternalPosition | false => {
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
const externalActionFromAny = (arg: any): ExternalAction => {
    if (Array.isArray(arg) && arg.length === 2) {
        const p1 = externalPositionFromAny(arg[0])
        const p2 = externalPositionFromAny(arg[1])

        if (!!p1 && !!p2) {
            return [p1, p2]
        }
    }

    return false
}

export {
    Message,
    StartMessage,
    PlayingAsMessage,
    PlayingWithMessage,
    SetupMessage,
    TakeTurnMessage,
    EndMessage,
}

export {
    ExternalColor,
    ExternalPosition,
    ExternalAction,
    ExternalPlayer,
    ExternalState,
    externalPositionFromAny,
    externalActionFromAny,
}
