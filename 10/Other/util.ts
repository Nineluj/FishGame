/**
 * Display usage information for the program and terminates the program with an error code
 * @param message Custom message to display to user after terminating program
 */
const panic = (message: string): void => {
    console.error(`Incorrect usage: ${message}`)
    console.log("usage: ./xserver <port>")
    process.exit(-1)
}

const printDebug = !!process.env.DEBUG

const debugPrint = (message: string): void => {
    if (printDebug) {
        console.log(">", message)
    }
}

export { panic, debugPrint }
