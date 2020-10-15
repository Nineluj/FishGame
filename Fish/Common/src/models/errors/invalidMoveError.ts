/**
 * Error class for when an argument for a function are invalid
 */
class InvalidMoveError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = "InvalidMoveError"
    }
}

export { InvalidMoveError }
