// import * as net from "net"
// import { TimeoutError } from "../../Fish/Common/src/models/errors/timeoutError"
// import { IllegalArgumentError } from "../../Fish/Common/src/models/errors/illegalArgumentError"
//
// const WAIT_TIME_MS = 30000 // 30s
// const MIN_PLAYERS_NEEDED = 5
// const MAX_PLAYERS_ALLOWED = 10
//
// const PLAYER_MSG_TIMEOUT_MS = 1000
//
// const runWaitingRoom = async (server: net.Server) => {
//     const state = {
//         connectionCount: 0,
//     }
//
//     server.on("connection", (conn: net.Socket) => {
//         tryRegisterClient(conn)
//     })
// }
//
// const tryRegisterClient = async (conn: net.Socket): Promise<string> => {
//     conn.setTimeout(PLAYER_MSG_TIMEOUT_MS)
//     conn.on("timeout", () => {
//         throw new TimeoutError()
//     })
//
//     conn.on("data", (sent: Buffer) => {
//         const msg = sent.toString()
//
//         if (validateUsername(msg)) {
//             return msg
//         }
//
//         throw new IllegalArgumentError("Client sent invalid username")
//     })
// }
//
// const NAME_MAX_LEN = 12
// const NAME_MIN_LEN = 1
// const CHAR_MIN = "a".charCodeAt(0)
// const CHAR_MAX = "z".charCodeAt(0)
//
// /**
//  *
//  * @param name
//  */
// const validateUsername = (name: string): boolean => {
//     const len = name.length
//
//     if (len < NAME_MIN_LEN || len > NAME_MAX_LEN) {
//         return false
//     }
//
//     for (let c of name) {
//         const charCode = c.charCodeAt(0)
//         if (charCode > CHAR_MAX || charCode < CHAR_MIN) {
//             return false
//         }
//     }
//
//     return true
// }
