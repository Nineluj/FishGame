/**
 * Error class for when an argument for a function are invalid
 */
class IllegalArgumentError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = "IllegalArgumentError"
    }
}

export { IllegalArgumentError }
