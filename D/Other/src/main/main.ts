/**
 * Entry point of the Election app.
 */
import { app, BrowserWindow, ipcMain } from "electron"
import * as path from "path"
import * as url from "url"

const SIZE_MIN = 1
const SIZE_MAX = 399

let mainWindow: Electron.BrowserWindow | null
let hexSize: number

function createWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
            webSecurity: false,
            devTools: process.env.NODE_ENV === "production" ? false : true,
        },
    })

    const windowUrl = url.format({
        pathname: path.join(__dirname, "./index.html"),
        protocol: "file:",
        slashes: true,
        query: {
            size: hexSize,
        },
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

const panic = (msg: string) => {
    console.error(msg)
    process.exit(-1)
}

let args = process.argv.slice(2)

if (args.length !== 1) {
    panic("wrong number of arguments")
}

let userInput = parseInt(args[0])

if (isNaN(userInput)) {
    panic("input is not a number")
} else if (userInput < SIZE_MIN || userInput > SIZE_MAX) {
    panic("input isn't in range [1,399]")
}

hexSize = userInput

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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
