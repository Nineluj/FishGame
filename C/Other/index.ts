const Parser = require('jsonparse')

const p = new Parser()
const stdin = process.stdin
stdin.setEncoding('utf8')

stdin.on('data', (chunk: string) => {
    p.write(chunk)
})

const objects: Array<string> = []
p.onValue = function(val: any) {
    if (this.stack.length == 0) {
        objects.push(val)
    }
}

stdin.on('end', () => {
    console.log(objects.length, objects)
})

// let data: Array<string> = []
// stream.on('data', (chunk: string) => {
//     data.push(chunk)
// })
//
// stream.on('end', () => {
//     const text = data.join("")
//     text.pipe()
//     })
// })
//
