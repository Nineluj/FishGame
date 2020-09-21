import * as React from "react"
import * as electron from "electron"
import Hexagon from "@/renderer/hexagon/hexagon"

const Root: React.FC = () => {
    const params = new URLSearchParams(window.location.search)
    const hexSize = params.has("size")
        ? parseInt(params.get("size") as string)
        : 0

    const onClick = (_: Event): void => {
        electron.ipcRenderer.send("close-me")
    }

    return (
        <div className="center">
            <Hexagon size={hexSize} clickHandler={onClick} />
        </div>
    )
}

export default Root
