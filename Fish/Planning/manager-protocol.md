# Manager Protocol

## Managing Players and Games

The main functionality of a TournamentManager is to assign players and referees to games within the tournament, and managing multiple rounds of games. The type of tournament being run is up to the TournamentManager - they can choose to implement a round robin tournament, or they may choose to implement a bracket style elimination tournament. The TournamentManager may also choose how scoring works in the tournament - it can be the sum of all of a player's scores in each game they play in, it can be the number of matches they win, or any other system the TournamentManager devises. The TournamentManager must keep track of the players that are participating, who has lost, the players that have been banned by a referee, and the number of matches that each player has won. It must also keep track of all games in progress, and all games that have already been completed, so that an observer may go back and see how the tournament played out.

In order to start a tournament, a TournamentManager should be run with the `startTournament(players)` method. This will place all of the players into new games with their referees, and begin the tournament.

## Communication with TournamentObservers

One of the other responsibilities of the tournament manager is to provide visibility into the current state of the tournament for TournamentObservers; People who are not participating in the tournament, but want to watch it and see how it plays out.

For these users, a TournamentManager provides the following functionalities:

-   `getGamesInProgress()`: Lets an observer see all games in progress, along with their current GameStates and previouse GameStates (both available through methods on the referee interface)
-   `getCompletedGames()`: Lets an observer see all of the completed games in the tournament, along with their play-by-play history, the final gamestate, and the winner (all available through the Referee interface returned along with the list of players)
-   `getPlayers()`: Lets an observer see a list of all players registered for the tournament, along with the number of matches they've won, and if they've lost, or been banned by a referee
-   `getLeaderboard()`: Lets an observer see the current standing of each player in the scoring system devised by the TournamentManager. This list may or may not include all players in the tournament depending on the TournamentManagers scoring system - banned players may be excluded, and only the top 5-10 players may be returned at the discretion of the TournamentManager

## Communication with Referees

When a TournamentManager wants to run a new match, they must create a new instance of a Referee and pass in the players that are to participate in this match. The referee is then responsible for communicating with those players from this point forward and running the game.

When a game has been completed, a referee will invoke the `reportGameOutcome` method on the TournamentManager, and pass itself in with all of its internal results. This lets the TournamentManager know that the referee is free to run another game now, as well as which players have progressed to the next round. The TournamentManager must store the results of this match for Observers to access at any point in the future, and then if enough players are not actively playing in a match, create another instance of a Referee and place those players into a new game.
