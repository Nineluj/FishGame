/**
 * React renderer.
 */
import * as React from "react"
import * as ReactDOM from "react-dom"

// Import the styles here to process them with webpack
import "@public/style.css"
import Root from "@/renderer/root"

ReactDOM.render(
    <div>
        <Root />
    </div>,
    document.getElementById("app")
)
