/**
 * React renderer.
 */
import * as React from "react"
import * as ReactDOM from "react-dom"

// Import the styles here to process them with webpack
import "../../public/style.css"
import Root from "./root"

// Render the root component
ReactDOM.render(<Root />, document.getElementById("app"))
