export interface Writer {
    write: (arg0: string) => void
}

type Limit = number | "inf"
const limitFlagValue = 20

/**
 * Prints the message up to limit times or forever if it's infinite
 * @param message The message to print to STDOUT
 * @param limit Number of times to print
 * @param writer Where to output the string to
 */
const printMessage = (message: string, limit: Limit, writer: Writer) : void => {
    for (let i = 0; limit == "inf" || i !== limit; i++) {
        writer.write(message)
    }
}

/**
 * Reads input from argv and returns the message to print and the limit
 */
const parseInput = (args: Array<string>) : {message : string, limit: Limit} => {
    let message = "hello world"
    let limit: Limit = "inf"

    let nArgs = args.length

    if (nArgs > 0) {
        if (args[0] == "-limit") {
            limit = limitFlagValue

            if (nArgs > 1) {
                // use slice to remove the -limit flag
                message = args.slice(1).join(" ")
            }
        } else {
            message = args.join(" ")
        }
    }

    return {message, limit}
}

/**
 * Writes the arguments to the writer infinite number of times unless the first argument is limit
 * @param args What to print out, first item can be "-limit" to only print 20 times
 * @param writer The location where we write to
 */
export const xyes = (args: Array<string>, writer: Writer) : void => {
    const { message, limit } = parseInput(args)
    printMessage(message, limit, writer)
}

if (require.main == module) {
    const consoleWriter = {
        write: (arg0: string) : void => {
            console.log(arg0)
        }
    }
    // slice args here since first two args are node and file being run
    xyes(process.argv.slice(2), consoleWriter)
}
