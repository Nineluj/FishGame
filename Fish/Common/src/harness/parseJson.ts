import { Duplex, Stream } from "stream"
import { Readable } from "stream"

const Parser = require("jsonparse")
const deasync = require("deasync")

/**
 * Parses a stream of JSON objects from stdin, and invokes the callback function
 * when the end of the stream is detected
 *
 * @param callback Function to call with the array of parsed JSON objects
 */
export const parseJsonObjectsFromStdIn = (
    callback: (data: Array<any>) => void
) => {
    const stream = process.stdin
    stream.setEncoding("utf8")
    parseJsonFromStreamAsync(stream).then((res) => callback(res))
}

export const getJsonArrFromStream = (stream: Readable): Array<any> => {
    let out: Array<any> = []
    let done = false

    parseJsonFromStreamAsync(stream).then((res) => {
        out = res
        done = true
    })

    deasync.loopWhile(() => !done)

    return out
}

export const parseJsonFromStreamAsync = (
    stream: Readable
): Promise<Array<any>> => {
    return new Promise<Array<any>>((resolve) => {
        const p = new Parser()

        stream.on("data", (chunk: string) => {
            p.write(chunk)
        })

        const objects: Array<string> = []
        p.onValue = function (val: any) {
            if (this.stack.length == 0) {
                objects.push(val)
            }
        }

        stream.on("end", () => {
            return resolve(objects)
        })
    })
}
