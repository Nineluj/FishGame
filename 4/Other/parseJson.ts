const Parser = require("jsonparse");

/**
 * Parses a stream of JSON objects from stdin, and invokes the callback function
 * when the end of the stream is detected
 *
 * @param callback Function to call with the array of parsed JSON objects
 */
export const parseJsonObjectsFromStdIn = (
  callback: (data: Array<any>) => void
) => {
  const p = new Parser();
  const stdin = process.stdin;
  stdin.setEncoding("utf8");

  stdin.on("data", (chunk: string) => {
    p.write(chunk);
  });

  const objects: Array<string> = [];
  p.onValue = function(val: any) {
    if (this.stack.length == 0) {
      objects.push(val);
    }
  };

  stdin.on("end", () => {
    callback(objects);
  });
};
