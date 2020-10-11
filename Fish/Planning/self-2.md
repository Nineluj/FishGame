## Self-Evaluation Form for Milestone 2

A fundamental guideline of Fundamentals I, II, and OOD is to design
methods and functions systematically, starting with a signature, a
clear purpose statement (possibly illustrated with examples), and
unit tests.

Under each of the following elements below, indicate below where your
TAs can find:

- the data description of tiles, including an interpretation:
  - [Fish/Common/src/models/tile.ts:4](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/f450ea021eadd7f5350098e81cdbc122f0ecdf36/Fish/Common/src/models/tile.ts#L4) - It describes the data type of pieces on the board, and how both tiles and holes are defined.

- the data description of boards, include an interpretation:
  - [Fish/Common/src/models/board.ts:9](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/f450ea021eadd7f5350098e81cdbc122f0ecdf36/Fish/Common/src/models/board.ts#L9) - The board is stored in a map accessed by hashed coordinates, and the coordinate system used is linked in the class description

- the functionality for removing a tile:
  - purpose: [Fish/Common/src/models/board.ts:37](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/f450ea021eadd7f5350098e81cdbc122f0ecdf36/Fish/Common/src/models/board.ts#L37) - The set method can be used to set a position on the board to be a hole
  
  - signature: [Fish/Common/src/models/board.ts:41](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/f450ea021eadd7f5350098e81cdbc122f0ecdf36/Fish/Common/src/models/board.ts#L41) - The signature is included with types in the method header, since it is written in TypeScript
  
  - unit tests: [Fish/Common/src/models/board.test.ts:56](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/f450ea021eadd7f5350098e81cdbc122f0ecdf36/Fish/Common/src/models/board.test.ts#L56) - This unit test sets a position to be a hole in order to test the getReachableTiles functionality.

- the functionality for reaching other tiles on the board:
  - purpose: [Fish/Common/src/models/board.ts:85](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/f450ea021eadd7f5350098e81cdbc122f0ecdf36/Fish/Common/src/models/board.ts#L85) - This method returns a list of all of the tiles reachable from any given position on the board
  
  - signature: [Fish/Common/src/models/board.ts:87](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/f450ea021eadd7f5350098e81cdbc122f0ecdf36/Fish/Common/src/models/board.ts#L87) - The signature of this function (with types) is included in the function header since it is written in TypeScript
  
  - unit tests: [Fish/Common/src/models/board.test.ts:56](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/f450ea021eadd7f5350098e81cdbc122f0ecdf36/Fish/Common/src/models/board.test.ts#L56) - This unit test sets up the board with some holes and pieces, and verifies that the correct set of tiles are returned

The ideal feedback is a GitHub perma-link to the range of lines in specific
file or a collection of files for each of the above bullet points.

  WARNING: all such links must point to your commit "f450ea021eadd7f5350098e81cdbc122f0ecdf36".
  Any bad links will result in a zero score for this self-evaluation.
  Here is an example link:
    <https://github.ccs.neu.edu/CS4500-F20/sunnyvale/tree/f450ea021eadd7f5350098e81cdbc122f0ecdf36/Fish>

A lesser alternative is to specify paths to files and, if files are
longer than a laptop screen, positions within files are appropriate
responses.

In either case you may wish to, beneath each snippet of code you
indicate, add a line or two of commentary that explains how you think
the specified code snippets answers the request.
