// const Parser = require("jsonparse")

/**
 * Class for reading a JSON stream into JS objects
 */
// class JsonReader {
//     inStream: NodeJS.ReadStream
//     jsonParser: any
//     // parsedObjects: Array<any>

//     constructor(stream: NodeJS.ReadStream, jsonParser: any) {
//         this.inStream = stream
//         this.jsonParser = jsonParser

//         this.setupParser()
//     }

//     addObject(newObj: any) {
//         this.parsedObjects.push(newObj)
//     }

//     /**
//      * Sets up the internal JSON parser
//      * The jsonParser used is a little outdated, we need to manually
//      * hook up callback functions
//      */
//     setupParser() {
//         const self = this
//         this.jsonParser.onValue = function (val: any) {
//             // Check that the parsed value is at the top level of the
//             // stream, and not nested
//             if (this.stack.length == 0) {
//                 self.addObject(val)
//             }
//         }

//         this.inStream.on("data", (data) => {
//             this.jsonParser.write(data)
//         })
//     }
// }

/**
 * TODO: write
 * @param stream
 */
// const jsonStreamToObjects = async (
//     stream: NodeJS.ReadStream
// ): Promise<Array<any>> => {
//     const internalParser = new Parser()
//     const reader = new JsonReader(stream, internalParser)

//     return []
// }
