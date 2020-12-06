# Remote Fish Game

This directory contains components related to the remote proxy pattern for tournaments of Fish. Remote players in the tournament register to play over TCP connection.

### File Organization

```
Remote/
├── src/                    # All files related to remote
│   ├── common              # Directory of files and code used by both the client and server
│   │   ├── connection.ts   # Components to send and receive data over tcp
│   │   ├── schemas.ts      # JSON schemas for message formats between server and client, used for verification
│   │   └── types.ts        # Data definitions for the message types and method to verify message formats
│   └── proxy               # Directory for the interfaces used to connect managers to remote players over tcp
│   │   ├── client-proxy.ts # Client side component to listen for messages from the server and dispatch to remote players
│   │   └── player-proxy.ts # Server side component for the manager and referee to interface with remote players
└── README.md               # This README
```

Note: All \*.test.ts files are test files for the respective components.

### Changes outside of `Remote/`

-   Added `notifyPlayingAs` to PlayerInterface
-   Added `notifyPlayingWith` to PlayerInterface
-   Added `convertToOutputState` harness adapter
-   Got rid of `updateGameState`, it is not needed since the state of the game is passed to players in the take turn functionality
-   Changed Referee to keep track of a `VerifiableGameState` rather than just `GameState`
    -   `VerifiableGameState` is a wrapper around GameState which indicates what phase of the game it is currently in. In the past, it only kept track of a game state, and a game state had a phase. This led to issues when trying to serialize and deserialize the game state after players were kicked.
    -   `VerifiableGameState` is one of:
        -   `Placement`, indicating that the game is currently in penguin placement stage
        -   `Moving`, players are making moves. This wrapper uses the game tree (`GameNode`)
        -   `Over`, the game has ended and there may be winner(s)
