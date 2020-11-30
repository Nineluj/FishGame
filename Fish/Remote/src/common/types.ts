import {
    ExternalState,
    ExternalColor,
    ExternalAction,
} from "../../../Common/src/adapters/types"
import Ajv from "ajv"

/* Types for messages sent between the server and the client */
type Message = [string, Array<any>]
type StartMessage = Message & ["start", [boolean]]
type PlayingAsMessage = Message & ["playing-as", [ExternalColor]]
type PlayingWithMessage = Message & ["playing-with", [Array<ExternalColor>]]
type SetupMessage = Message & ["setup", [ExternalState]]
type TakeTurnMessage = Message &
    ["take-turn", [ExternalState, Array<ExternalAction>]]
type EndMessage = Message & ["end", [boolean]]

type VoidResponse = "void"

const verify = (data: any, schema: Object): boolean => {
    const ajv = new Ajv()
    const validate = ajv.compile(schema)
    const valid = validate(data)

    return !!valid
}

export {
    Message,
    StartMessage,
    PlayingAsMessage,
    PlayingWithMessage,
    SetupMessage,
    TakeTurnMessage,
    EndMessage,
    verify,
    VoidResponse,
}
