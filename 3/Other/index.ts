import { getReachableTilesFrom } from "../../Fish/Common/src/models/board";
import { makeBoardFromTestInput, convertToBoardLocation } from "./xboard";
import { parseJsonObjectsFromStdIn } from "./parseJson";

interface TestData {
  board: Array<Array<number>>;
  position: [number, number];
}

/**
 * Runs a single test case and prints the number of reachable positions
 * for the position on the given board as a number to STDOUT
 * @param input The testdata for a single test case
 */
const runTest = (input: TestData) => {
  const board = makeBoardFromTestInput(input.board);

  const position = convertToBoardLocation(input.position[0], input.position[1]);

  const reachableTiles = getReachableTilesFrom(board, position);

  console.log(reachableTiles.length);
};

/**
 * Parses a JSON object from STDIN, runs it as a single test case, and prints out the
 * result to STDOUT
 */
const main = () => {
  // parse objects from stdin, invoke runTest on first json object when stdin stream ends
  parseJsonObjectsFromStdIn(data => {
    runTest(data[0]);
  });
};

main();
