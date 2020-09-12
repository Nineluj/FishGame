type Limit = number | "inf"
const limitFlagValue = 20

/**
 * Prints the message up to limit times or forever if it's infinite
 * @param message The message to print to STDOUT
 * @param limit Number of times to print
 */
const printMessage = (message: string, limit: Limit) : void => {
    for (let i = 0; limit == "inf" || i !== limit; i++) {
        console.log(message)
    }
}

/**
 * Reads input from argv and returns the message to print and the limit
 */
const parseInput = () : {message : string, limit: Limit} => {
    let message = "hello world"
    let limit: Limit = "inf"

    let args = process.argv.slice(2)
    let nArgs = args.length

    if (nArgs > 0) {
        if (args[0] == "-limit") {
            limit = limitFlagValue

            if (nArgs > 1) {
                message = args[1]
            }
        } else {
            message = args[0]
        }
    }

    return {message, limit}
}

export const main = () : void => {
    const { message, limit } = parseInput()
    printMessage(message, limit)
}

main()
