/**
 * Error class for when an argument for a function are invalid
 */
export class GamePhaseError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = "GamePhaseError"
    }
}
