import { readdir } from "fs";
import {
  Board,
  boardSet,
  getReachableTilesFrom,
  boardGet
} from "../../Fish/Common/src/models/board";
import { Point } from "../../Fish/Common/src/models/point";
import chalk from "chalk";

const isEven = (num: number): boolean => {
  return num % 2 === 0;
};

/**
 * Given a datapoint using a coordinate system as below, convert it to the
 * odd-q coordinate system described here: https://www.redblobgames.com/grids/hexagons/#coordinates-offset
 *      INPUT COORDINATES                   OUTPUT COORDINATES
 *  (0,0)  (0,1)  (0,2)  (0,3)          (0,0)  (2,0)  (4,0)  (6,0)
 *     (1,0)  (1,1)  (1,2)                 (1,0)  (3,0)  (5,0)
 *  (2,0)  (2,1)  (2,2)  (2,3)          (0,1)  (2,1)  (4,1)  (6,1)
 *     (3,0)  (3,1)  (3,2)                 (1,1)  (3,1)  (5,1)
 *
 * @param row the X coordinate of the position in the original coordinate system
 * @param col the Y coordinate of the position in the original coordinate system
 */
export const convertToBoardLocation = (row: number, col: number): Point => {
  const newY = Math.floor(row / 2);
  let newX;
  if (isEven(row)) {
    newX = col * 2;
  } else {
    newX = col * 2 + 1;
  }

  return { x: newX, y: newY };
};
/**
 * Given a 2d array of coordinates using a coordinate system as below, convert it to the
 * odd-q coordinate system described here: https://www.redblobgames.com/grids/hexagons/#coordinates-offset
 *
 *      INPUT COORDINATES                   OUTPUT COORDINATES
 *  (0,0)  (0,1)  (0,2)  (0,3)          (0,0)  (2,0)  (4,0)  (6,0)
 *     (1,0)  (1,1)  (1,2)                 (1,0)  (3,0)  (5,0)
 *  (2,0)  (2,1)  (2,2)  (2,3)          (0,1)  (2,1)  (4,1)  (6,1)
 *     (3,0)  (3,1)  (3,2)                 (1,1)  (3,1)  (5,1)
 *
 * @param boardData a 2d array of numbers, where 0 means the coordinates is a hole
 * and any positive number is the number of fish on the tile
 */
export const makeBoardFromTestInput = (
  boardData: Array<Array<number>>
): Board => {
  let board: Board = [[]];

  for (let i = 0; i < boardData.length; i++) {
    const row = boardData[i];
    for (let j = 0; j < row.length; j++) {
      const numFish = row[j];
      const newCoordinates = convertToBoardLocation(i, j);
      const tile = numFish === 0 ? "hole" : { fish: numFish, occupied: false };
      board = boardSet(board, newCoordinates, tile);
    }
  }

  return board;
};
