import { PenguinColor, Player } from "../../../Common/src/models/player"
import {
    GameState,
    MAX_PLAYER_COUNT,
    MIN_PLAYER_COUNT,
} from "../../../Common/src/models/gameState"
import { Action } from "../../../Common/src/models/action"
import {
    createGameState,
    createGameStateCustomBoard,
    getPlayerWhoseTurnItIs,
} from "../../../Common/src/models/gameState/gameState"
import { PlayerInterface } from "../../../Common/player-interface"
import { createEliminatePlayerAction } from "../../../Common/src/models/action/action"
import { Board } from "../../../Common/src/models/board"
import { createPlayer } from "../../../Common/src/models/testHelpers/testHelpers"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import {
    callAsyncFunctionSafely,
    callFunctionSafely,
    didFail,
    didFailAsync,
} from "../utils/communications"

// The order in which the referee will assign the colors to the players
export const colorOrder: Array<PenguinColor> = [
    "red",
    "white",
    "brown",
    "black",
]

/**
 * Represents players' outcome of a game separated into winners and losers
 */
export type GameResult = {
    // players who achieved the highest score
    winners: Array<string>
    // players who did not achieve the highest score
    losers: Array<string>
    // players who errored throughout the game and were kicked out
    failures: Array<string>
}

/**
 * A Game observer is a component that gets notified about updates to a game
 */
interface GameObserver {
    // Tells the observer about an update to the game
    update: (gs: GameState) => Promise<void>

    // Tells the observer that the game is over, the observer won't receive
    // any more information
    notifyOver: (result: GameResult) => Promise<void>
}

/**
 * Component that knows how to run a complete game of fish for
 * a set of players
 *
 * Constraints: When the referee encounters failing players it kicks them out
 * The cases the referee considers before kicking out the player are:
 *  - Players that error (throw Errors)
 *  - Players that submit invalid actions
 *
 * We leave the timeout feature to the tcp player to monitor. We trust the house players
 * not to time out. If a Player goes into an infinite loop, we will not be able to prevent that
 */
class Referee {
    // observers following this game
    private observers: Array<GameObserver>

    // gameState keeps track of the current state of the game
    private gameState: GameState

    // initialGame doesn't change once set and keeps track of what the
    // game was like at the very beginning
    private initialGame: GameState

    // keeps all the moves made in this game, including eliminationActions when a
    // player gets eliminated for making a bad move
    private history: Array<Action>

    private eliminatedPlayerIds: Set<string>

    // references to the player objects that know how to play in a game of fish
    private players: Map<string, PlayerInterface>

    /**
     * Constructs a new referee and begins the game.
     * @param players the set of players playing in the game sorted for the desired order of play
     * @param board optionally, a specific board that should be used for this game
     * @param playerIds optionally, the IDs to assign for the participating players,
     *        otherwise use colors to identify the players instead
     */
    constructor(
        players: Array<PlayerInterface>,
        board?: Board,
        playerIds?: string[]
    ) {
        const gamePlayers = Referee.createGamePlayers(players.length, playerIds)

        if (board) {
            this.initialGame = createGameStateCustomBoard(gamePlayers, board)
        } else {
            this.initialGame = createGameState(gamePlayers)
        }

        this.gameState = this.initialGame

        this.eliminatedPlayerIds = new Set()
        this.history = []
        this.players = new Map()

        players.forEach((p, playerIndex) => {
            this.players.set(gamePlayers[playerIndex].id, p)
        })

        this.observers = []
    }

    /**
     * Runs through an entire game by going through the placement and movement phase
     *
     * Constraints: When the referee encounters failing players it kicks them out
     * The cases the referee considers before kicking out the player are:
     *  - Players that error
     *  - Players that submit invalid moves
     * The Game State is immutable so players are unable to change the ground truth of the game
     *
     * We leave the timeout feature to the tcp player to monitor. We trust the house players
     * not to time out. If a Player goes into an infinite loop, we will not be able to prevent that
     */
    async runGamePlay(): Promise<GameResult> {
        await this.notifyPlayersOfColorInformation()
        await this.runPlacementPhase()
        await this.runGameMovementPhase()

        this.notifyObserversGameOver()
        return this.getPlayerResults()
    }

    /**
     * Tells the players what color they are playing as and all the colors
     * that have been assigned for this game
     */
    private async notifyPlayersOfColorInformation() {
        const models = this.initialGame.players
        const allColors = models.map((playerModel) => playerModel.penguinColor)

        for (const playerModel of models) {
            const playerId = playerModel.id
            const opponentColors = this.getOpponentColors(playerId, models)
            const playerInterface = this.players.get(playerId)!
            await this.callAndKickIfFail(async () => {
                await playerInterface.notifyPlayAs(playerModel.penguinColor)
                await playerInterface.notifyPlayWith(opponentColors)
            }, playerId)
        }
    }

    /**
     * Get the other player's colors for this game.
     * Do not include the give player's color in the output list.
     */
    private getOpponentColors(
        playerId: string,
        playersModels: Array<Player>
    ): Array<PenguinColor> {
        const opponentColors: Array<PenguinColor> = playersModels.reduce(
            (colors, currPlayer) => {
                if (currPlayer.id !== playerId) {
                    colors.push(currPlayer.penguinColor)
                }
                return colors
            },
            [] as PenguinColor[]
        )
        return opponentColors
    }

    /**
     * Creates the player knowledge for the game state
     */
    static createGamePlayers(
        numberOfPlayers: number,
        playerIds?: string[]
    ): Array<Player> {
        let out: Array<Player> = []
        if (
            numberOfPlayers < MIN_PLAYER_COUNT ||
            numberOfPlayers > MAX_PLAYER_COUNT
        ) {
            throw new IllegalArgumentError(
                `Number of players must be between 2 and 4 received ${numberOfPlayers}`
            )
        }
        for (
            let playerIndex = 0;
            playerIndex < numberOfPlayers;
            playerIndex++
        ) {
            let playerId: string = colorOrder[playerIndex]
            if (playerIds) {
                playerId = playerIds[playerIndex]
            }

            out.push(createPlayer(colorOrder[playerIndex], playerId))
        }

        return out
    }

    /**
     * Registers a new observer to observe the game managed by
     * this referee
     */
    registerGameObserver(go: GameObserver): void {
        this.observers.push(go)
    }

    /**
     * Returns the players in this game that contain their scores and colors as well as
     * the list of the eliminated players.
     */
    getPlayerStatuses(): {
        players: Array<Player>
        eliminatedPlayerIds: Array<string>
    } {
        return {
            players: this.gameState.players,
            eliminatedPlayerIds: Array.from(this.eliminatedPlayerIds),
        }
    }

    /**
     * Gets the winning and losing players from the game after it is run.
     * Throws an error if it is called before the game is completed.
     */
    getPlayerResults(): GameResult {
        if (this.gameState.phase !== "over") {
            throw new IllegalArgumentError(
                "cannot get the winning players before the game is over"
            )
        }

        let results: GameResult = {
            winners: [],
            losers: [],
            failures: Array.from(this.eliminatedPlayerIds),
        }

        let bestScore = 0

        this.gameState.players.forEach((player) => {
            if (player.score > bestScore) {
                results.losers = results.losers.concat(results.winners)
                results.winners = [player.id]

                bestScore = player.score
            } else if (player.score === bestScore) {
                results.winners.push(player.id)
            } else {
                results.losers.push(player.id)
            }
        })

        return results
    }

    /**
     * Returns a replay of the game up until this point
     */
    getReplay(): Array<Action> {
        return [...this.history]
    }

    /**
     * Returns the current phase of this game.
     */
    getGamePhase(): "penguinPlacement" | "playing" | "over" {
        return this.gameState.phase
    }

    /**
     * Get game observers
     */
    getGameObservers(): Array<GameObserver> {
        return this.observers
    }

    /**
     * Loops through game state until the game has ended. Requests player actions for each turn.
     * Handles invalid actions appropriately.
     */
    async runGameMovementPhase() {
        while (this.gameState.phase === "playing") {
            await this.playTurn()
        }
    }

    /**
     * Loop through the placement phase of the game. Requests the player placements for each turn.
     */
    async runPlacementPhase() {
        while (this.gameState.phase === "penguinPlacement") {
            await this.playTurn()
        }
    }

    /**
     * Plays a single turn and updates all the players of the changes in the game.
     */
    async playTurn() {
        const nextToPlay = getPlayerWhoseTurnItIs(this.gameState)
        await this.getPlayerActionOrEliminate(nextToPlay.id)

        this.notifyObserversNewGameState()
    }

    /**
     * Get the last action of the the game.
     * Used to alert players of the last action on the game state,
     * and is only called after at least one action has been called.
     */
    private getLastAction(): Action {
        return this.history[this.history.length - 1]
    }

    /**
     * Calls the given asynchronous function and if it fails kick the player
     * with the given playerId
     */
    private async callAndKickIfFail(fn: () => Promise<any>, playerId: string) {
        let result = await callAsyncFunctionSafely(async () => fn())

        if (await didFailAsync(result)) {
            await this.kickPlayer(playerId)
        }
    }

    /**
     * Kicks out the player from this game and optionally notify them and give them
     * a reason. Then announces to all the remaining players that the given player was kicked.
     */
    async kickPlayer(
        playerId: string,
        reason: string = "",
        notify: boolean = false
    ): Promise<void> {
        const elimAction = createEliminatePlayerAction(playerId)
        this.history.push(elimAction)
        this.eliminatedPlayerIds.add(playerId)

        this.gameState = elimAction.apply(this.gameState)

        if (notify) {
            // we don't care about any return value
            callAsyncFunctionSafely(async () => {
                await this.players.get(playerId)!.notifyBanned(reason)
            })
        }

        this.players.delete(playerId)
    }

    /**
     * Asks the player for it's action based on the current game state. If this action is valid, it modifies the game state.
     * Otherwise it removes the player from the game.
     * @param playerId the id of the player that will make an action
     */
    private async getPlayerActionOrEliminate(playerId: string): Promise<void> {
        const player = this.players.get(playerId)!

        const maybePlayerAction = await callAsyncFunctionSafely(
            async (): Promise<Action> =>
                await player.getNextAction(this.gameState)
        )

        if (await didFailAsync(maybePlayerAction)) {
            await this.kickPlayer(playerId)
            return
        }

        const playerAction = maybePlayerAction as Action

        try {
            this.gameState = playerAction.apply(this.gameState)
            this.history.push(playerAction)
        } catch (e) {
            await this.kickPlayer(playerId, e.message, true)
        }
    }

    /**
     * Returns a read only copy of the current GameState.
     */
    getGameState(): GameState {
        return this.gameState
    }

    /**
     * Notifies the observers of a new game state safely and removes
     * them if they error while they are notified
     */
    private notifyObserversNewGameState() {
        this.observers.forEach((go: GameObserver) => {
            go.update(this.gameState).catch(() => this.removeObserver(go))
        })
    }

    /**
     * Removes an observer
     * @param badObs The instance of observer to remove
     */
    private removeObserver(badObs: GameObserver) {
        this.observers = this.observers.filter((obs) => obs !== badObs)
    }

    /**
     * Notify all game observers that the game is over.
     * None of the observers will be called again after the game is over,
     * but still remove the observer if they fail or error when notified.
     */
    private async notifyObserversGameOver() {
        const result = this.getPlayerResults()

        this.observers.forEach((go: GameObserver) => {
            go.notifyOver(result).catch(() => this.removeObserver(go))
        })
    }
}

export { Referee, GameObserver }
