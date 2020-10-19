import { makeBoardFromTestInput, convertToBoardLocation } from "./xboard";
import {
  getReachableTilesFrom,
  boardGet
} from "../../Fish/Common/src/models/board";
import chalk from "chalk";
import { readdir } from "fs";

/**
 * Checks that running getReachableTiles on the board and position in the input
 * file results in the value found in the output file
 *
 * @param inputFilePath path pointing to a *-in.json test input file
 * @param outputFilePath path pointing to the corresponding *-out.json test output file
 * @returns True if the test case passed, false otherwise
 */
const runTestCase = (
  inputFilePath: string,
  outputFilePath: string
): boolean => {
  const input = require(inputFilePath);
  const output = require(outputFilePath);

  const board = makeBoardFromTestInput(input.board);

  const position = convertToBoardLocation(input.position[0], input.position[1]);

  const reachableTiles = getReachableTilesFrom(board, position);

  if (reachableTiles.length === output) {
    console.log(chalk.green.bold(`${inputFilePath}: passed`));
    return true;
  } else {
    console.log(chalk.red.bold(`${inputFilePath}: failed`));
    console.log(
      chalk.red(`     Expected (${output}), but got (${reachableTiles.length})`)
    );
    return false;
  }
};

/**
 * Runs the test harness on all files found in the Tests/ folder that can be found one directory up
 */
const main = (): void => {
  readdir("../Tests/", (err, fileNames) => {
    if (err) {
      console.error(chalk.red.bold("Could not find test files"), err);
      process.exit(-1);
    }

    let testsRun = 0;
    let testsPassed = 0;

    fileNames.forEach(fileName => {
      // Check if the filename is a valid test input file,
      // if it is, find corresponding output file and run test
      if (fileName.includes("-in.json")) {
        const input = fileName;
        const output = fileName.replace("-in.json", "-out.json");
        // run the test case, increment tests passed by one if the test case passed
        runTestCase(`../Tests/${input}`, `../Tests/${output}`)
          ? testsPassed++
          : null;
        testsRun++;
      }
    });

    console.log(
      chalk.blue.bold(`\n\n${testsPassed} out of ${testsRun} succeeded.`)
    );
  });
};

main();
