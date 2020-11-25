/**
 * Entry point of the Election app.
 * Attribution: file is based of boilerplate project
 * https://github.com/Devtography/electron-react-typescript-webpack-boilerplate
 */
import { app, BrowserWindow, ipcMain } from "electron"
import * as path from "path"
import * as url from "url"
import {
    MAX_PLAYER_COUNT,
    MIN_PLAYER_COUNT,
} from "../../../Common/src/models/gameState"

let mainWindow: Electron.BrowserWindow | null

/**
 * Display the main window
 */
function createWindow(): void {
    if (process.argv.length != 3) {
        console.log("ERR: Wrong number of arguments")
        app.quit()
    }

    const numPlayers = parseInt(process.argv[2])
    if (isNaN(numPlayers)) {
        console.log("ERR: Argument must be a number")
        app.quit()
    }

    if (numPlayers > MAX_PLAYER_COUNT || numPlayers < MIN_PLAYER_COUNT) {
        console.log(
            `ERR: Argument must be between ${MIN_PLAYER_COUNT} and ${MAX_PLAYER_COUNT}`
        )
        app.quit()
    }

    ;(<any>global).sharedObject = { numberOfPlayers: numPlayers }

    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 780,
        width: 800,
        webPreferences: {
            webSecurity: false,
            devTools: true,
        },
    })

    // Can use query here to pass data to app
    const windowUrl = url.format({
        pathname: path.join(__dirname, "./index.html"),
        protocol: "file:",
        slashes: true,
    })

    // and load the index.html of the app.
    mainWindow.loadURL(windowUrl)

    // Emitted when the window is closed.
    mainWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow)

ipcMain.on("close-me", (event: any, arg: any) => {
    app.quit()
})

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})
