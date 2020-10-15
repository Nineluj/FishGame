/**
 * Error class for when an argument for a function are invalid
 */
class GameStateActionError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = "InvalidActionPhase"
    }
}

export { GameStateActionError }
