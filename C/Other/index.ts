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
    // We have all the objects inside of "objects"
    const firstObj = {
        count: objects.length,
        seq: objects
    }

    const secondObj = [objects.length, ...([...objects].reverse())]

    process.stdout.write(JSON.stringify(firstObj))
    process.stdout.write(JSON.stringify(secondObj))
})
