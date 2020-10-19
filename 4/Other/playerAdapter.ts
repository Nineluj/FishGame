import { Player as InputPlayer } from "./index";
import { Player as OutputPlayer } from "../../Fish/Common/src/models/player";
import { convertToBoardLocation } from "./boardAdapter";

export const makePlayersFromTestInput = (
  players: Array<InputPlayer>
): Array<OutputPlayer> => {
  return players.map((p, index) => makePlayer(p, index));
};

const makePlayer = (p: InputPlayer, age: number): OutputPlayer => {
  return {
    age: age,
    id: `p${age}`,
    penguinColor: p.color,
    penguins: p.places.map((pos) => convertToBoardLocation(...pos)),
    score: p.score,
  };
};
