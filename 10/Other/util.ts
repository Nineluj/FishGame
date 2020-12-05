/**
 * Display usage information for the program and terminates the program with an error code
 * @param message Custom message to display to user after terminating program
 */
const panic = (message: string): void => {
    console.error(`Exited with error: ${message}`)
    process.exit(-1)
}

const printDebug = !!process.env.DEBUG
let printPrefix = { prefix: ">" }

const setDebugPrintPrefix = (prefix: string): void => {
    printPrefix.prefix = prefix
}

const debugPrint = (message: string): void => {
    if (printDebug) {
        console.log(printPrefix.prefix, message)
    }
}

export { panic, debugPrint, setDebugPrintPrefix }
