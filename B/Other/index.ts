let message = "hello world"
let limit = -1

// main reads arguments from the command line and __
const main = () : void => {
    let args = process.argv.slice(2)
    let nArgs = args.length

    if (nArgs > 0) {
        if (args[0] == "-limit") {
            limit = 20

            if (nArgs > 1) {
                message = args[1]
            }
        } else {
            message = args[0]
        }
    }

    for (let i = 0; i != limit; i++) {
        console.log(message)
    }
}

main()
