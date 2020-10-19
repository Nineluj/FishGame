import { makeBoardFromTestInput, convertToBoardLocation } from "./boardAdapter";
import { parseJsonObjectsFromStdIn } from "./parseJson";
import { Point } from "../../Fish/Common/src/models/point";
import { makePlayersFromTestInput } from "./playerAdapter";

export interface Player {
  color: "red" | "white" | "brown" | "black";
  score: number;
  places: Array<[number, number]>;
}

interface TestData {
  players: Array<Player>;
  board: Array<Array<number>>;
}

const runTest = (input: TestData) => {
  const board = makeBoardFromTestInput(input.board);
  const players = makePlayersFromTestInput(input.players);

  // ...
};

/**
 * Parses a JSON object from STDIN, runs it as a single test case, and prints out the
 * result to STDOUT
 */
const main = () => {
  // parse objects from stdin, invoke runTest on first json object when stdin stream ends
  parseJsonObjectsFromStdIn((data) => {
    runTest(data[0]);
  });
};

main();
