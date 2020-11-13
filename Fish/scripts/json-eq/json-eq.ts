/*
Usage: ./json-eq file1 file2
 */

const fs = require("fs")
const chalk = require("chalk")
import { isDeepStrictEqual } from "util"
import { getJsonArrFromStream } from "../../Common/src/harness/parseJson"

const main = (): void => {
    if (process.argv.length !== 4) {
        console.log(
            chalk.yellow(
                `Expecting 2 inputs, received ${process.argv.length - 2}`
            )
        )
        process.exit(-2)
    }

    const path1 = process.argv[2]
    const path2 = process.argv[3]

    let data1 = fs.createReadStream(path1, { encoding: "utf8" })
    let data2 = fs.createReadStream(path2, { encoding: "utf8" })

    let jsonArr1: Array<any> = getJsonArrFromStream(data1)
    let jsonArr2: Array<any> = getJsonArrFromStream(data2)

    if (jsonArr1.length !== jsonArr2.length) {
        console.log(
            chalk.red(
                `Different number of JSON objects ${jsonArr1.length} vs ${jsonArr2.length}`
            )
        )
        process.exit(-1)
    }

    for (let i = 0; i < jsonArr1.length; i++) {
        if (!isDeepStrictEqual(jsonArr1[i], jsonArr2[i])) {
            console.log(
                chalk.red(
                    `Found mismatch at index ${i}: \nEXPECTED: ${JSON.stringify(
                        jsonArr1[i]
                    )} \n============= vs ==========\nACTUAL: ${JSON.stringify(
                        jsonArr2[i]
                    )}`
                )
            )
            process.exit(-1)
        }
    }

    console.log(chalk.green("Success"))
    process.exit(0)
}

main()
