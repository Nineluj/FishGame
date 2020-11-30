/**
 * Error class for when an argument for a function are invalid
 */
class IllegalResponseError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = "IllegalResponseError"
    }
}

export { IllegalResponseError }
