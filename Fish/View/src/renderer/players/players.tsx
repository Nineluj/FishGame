import React from "react"
import {
    GameState,
    getPlayerWhoseTurnItIs,
} from "../../../../Common/src/models/gameState"
import { List, ListItem, ListItemText, Typography } from "@material-ui/core"
import { Player } from "../../../../Common/src/models/player"

interface Props {
    gameState: GameState
}

export const Players: React.FC<Props> = ({ gameState }) => {
    const currentTurnPlayerId = getPlayerWhoseTurnItIs(gameState).id
    return (
        <div>
            <List>
                {gameState.players.map((player: Player) => {
                    return (
                        <ListItem dense style={{ color: player.penguinColor }}>
                            <ListItemText>ID: {player.id}</ListItemText>
                            <ListItemText>Score: {player.score}</ListItemText>
                            <ListItemText>
                                {player.id === currentTurnPlayerId
                                    ? "Current Turn"
                                    : "Waiting for Turn"}
                            </ListItemText>
                        </ListItem>
                    )
                })}
            </List>
        </div>
    )
}
