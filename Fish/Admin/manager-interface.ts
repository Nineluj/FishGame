import { Referee } from "../Admin/src/referee/referee"

/**
 * Represents a player that has signed up for the tournament
 */
interface TournamentPlayer {
    /** A unique identifier for the player */
    id: string
    /** Has the player been banned by any referee during any of their games */
    banned: boolean
    /** Has the player lost and been eliminated from the remaining rounds of the tournamentt */
    loser: boolean
    /** How many matches the player has won */
    matchesWon: number
}

/** Represents a single game in a tournament */
interface TournamentGame {
    /** The referee that oversaw the game */
    referee: Referee
    /** The players that participated in the game */
    players: Array<TournamentPlayer>
}

/**
 * A TournamentManager is responsible for managing a tournament. It assigns players to games,
 * keeps track of player rankings throughout the tournament, and ultimately decides who the
 * winner of the tournament is.
 */
interface TournamentManager {
    /**
     * Instantiates a new TournamentManager with the specified players,
     * places all of the players into the first round of TournamentGames,
     * and waits for the referees to report back results of each game.
     *
     * **NOTE** This method cannot be invoked by TournamentObservers; This will
     * be enforced by MiddleWare in a future version of the software.
     */
    startTournament: (players: Array<TournamentPlayer>) => void

    /**
     * Returns a list of the games that are currently in the
     * penguin placement or playing phase. This method can
     * be used by observers to see what the current gameState
     * is and watch games in progress.
     *
     * The only method on TournamentGame.referee that a TournamentObserver
     * will have access to is getGameState(), getGamePhase(), and getPlayerStatuses()
     *  - they will not have permissions to call any of the methods that mutate the gamestate.
     */
    getGamesInProgress: () => Array<TournamentGame>

    /**
     * Returns a list of games that have been completed and have had
     * the outcome reported by the referee back to the tournament manager
     */
    getCompletedGames: () => Array<TournamentGame>

    /**
     * Returns a list of all players that were initially registered for the tournament,
     * and information about whether they were banned, whether they have lost, and what their
     * current score is.
     *
     * This method is accessible to a TournamentObserver
     */
    getPlayers: () => Array<TournamentPlayer>

    /**
     * Returns the leaderboard of players in the tournament, ordered by ranking
     * from highest (1st place) to lowest (last place). Depending on the tournament
     * system (i.e. bracket, round robin, etc.) this list may or may not
     * include all of the players registered in the tournament - it may
     * exclude banned players, or may only include the top 5, 10, etc. players.
     */
    getLeaderboard: () => Array<TournamentPlayer>

    /**
     * This method is used by a referee to report the outcome of a game. When a game is over,
     * a referee will report itself back to the TournamentManager, and the TournamentManager
     * will mark the game as completed, and use the results within the referee to assign remaining
     * players to their next match in the tournament and start the new match (if all players are ready).
     *
     * **NOTE** Future middleware will enforce that calls to this method are being
     * made by a referee, not by a TournamentObserver.
     */
    reportGameOutcome: (referee: Referee) => void
}
