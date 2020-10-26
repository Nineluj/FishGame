import {parseJsonObjectsFromStdIn} from "../../Fish/Common/src/harness/parseJson"
import {Point} from "../../Fish/Common/src/models/point"


interface ExternalState{}

interface MoveResponseQuery{
    state: ExternalState
    from: [number, number]
    to: [number, number]
}

type Output = false | [[number, number], [number, number]]

const runTestCase = (input: MoveResponseQuery): Output => {

    return false;

}


const main = () => {
    parseJsonObjectsFromStdIn((data: Array<any>) => {
        const output = runTestCase(data[0])
        console.log(JSON.stringify(output))
    })

}


main()