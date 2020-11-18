# Fish Remote Protocol
## Logical Interaction Diagram
![fish communication protocol](./Fish%20Communication%20Protocol-34.jpg)

### Message specifications
`signUpMsg` 
```typescript
// the ID that the player wishes to be identified with in the tournament
string
```

`standbyMsg`:
```typescript
"standby"
```

`tournamentStartingMsg`:
```typescript
"starting"
```

`promptNextActionMsg`:
```typescript
["action", state]

// state
{
    phase: "placement" | "playing"
    state: {
        // players in the order in which they play
        players: Player[]
        // Each number is between 0-5, where 0 represents a hole
        board: Number[][]
    }
}

// Position
[Nat, Nat]

// player
{
    color: "red" | "black" | "brown" | "white"
    score: Nat
    places: Position[]
}
```

`makeActionMsg`:
```typescript
[Position]
// OR
[Position, Position]
```

`notifyBannedMsg`:
```typescript
// string explains the reason why the player was banned
["banned", string]
```

`updateGameStateMsg`:
```typescript
["update", state]
```

`alertTournamentOverMsg`:
```typescript
// boolean represents if the player has won
["over", boolean]
```

## English Prose
The remote player can sign up by sending a `signUpMsg`. The communication layer then designates it to
the signup system tells the communication layer to inform the player to standby. To do this the
communication layer sends the player a `standbyMsg`.

Once it is time to start the tournament, the sign up system creates a tournament manager with all
signed up players. The tournament manager uses the communication layer to send out a
`tournamentStartingMsg` which tells the players that the tournament is starting.

From there, the tournament manager splits players into games by allocating them to referees.
When it is the player's turn (the diagram assumes that player goes first), the referee will
tell the communication layer to request an action from the player. The communication layer
will send a `promptNextAction` message. The player 

If at any point in this protocol a player takes too long to respond or if the connection between the
communication layer and the player closes


``
