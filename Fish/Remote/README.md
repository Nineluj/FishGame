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

### Changes

-   Added `notifyPlayingAs` to PlayerInterface
-   Added `notifyPlayingWith` to PlayerInterface
-   Added `convertToOutputState` harness adapter
-   Changed `updateGameState` -> `notifyOpponentAction`
