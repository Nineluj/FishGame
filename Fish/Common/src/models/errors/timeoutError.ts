/**
 * Error class for when an argument for a function are invalid
 */
class TimeoutError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = "TimeoutError"
    }
}

export { TimeoutError }
