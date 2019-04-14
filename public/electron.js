// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const url = require('url')
const IS_DEV = process.env.NODE_ENV === 'development'

// const isMac = process.platform === 'darwin'
// const isWin = process.platform === 'win32'

let mainWindow

function createWindow() {
    const menu = Menu.buildFromTemplate([])
    Menu.setApplicationMenu(menu) // 设置菜单部分

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 310,
        height: 300,
        title: '大哥大嫂过年好！',
        resizable: false,
        transparent: true,
        frame: false,
        titleBarStyle: 'customButtonsOnHover',
        // titleBarStyle: 'hidden',
        hasShadow: false,
        alwaysOnTop: true,
    })

    // 加载应用
    const staticIndexPath = path.join(__dirname, '../build/index.html');
    const main = IS_DEV ? `http://localhost:3000` : url.format({
        pathname: staticIndexPath,
        protocol: 'file:',
        slashes: true
    })
    mainWindow.loadURL(main)

    // IS_DEV && mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    app.quit()
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})