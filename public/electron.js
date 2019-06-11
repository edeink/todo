const {app, BrowserWindow, Menu, Tray, globalShortcut} = require('electron');
const path = require('path');
const url = require('url');
const IS_DEV = process.env.NODE_ENV === 'development';

// const isMac = process.platform === 'darwin'
// const isWin = process.platform === 'win32'

let win;

function createWindow() {
    const menu = Menu.buildFromTemplate([]);
    Menu.setApplicationMenu(menu); // 设置菜单部分

    // Create the browser window.
    win = new BrowserWindow({
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
    });

    // 加载应用
    const staticIndexPath = path.join(__dirname, '../build/index.html');
    const main = IS_DEV ? `http://localhost:3000` : url.format({
        pathname: staticIndexPath,
        protocol: 'file:',
        slashes: true
    });
    win.loadURL(main);

    // IS_DEV && win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', function () {
        win = null
    });

    // 系统托盘
    // const iconPath = path.join(__dirname, './favicon.ico');
    // let tray = new Tray(iconPath);
    // const contextMenu = Menu.buildFromTemplate([
    //     {
    //         label: '关闭', click: () => {
    //             win.destroy()
    //         }
    //     },
    // ]);
    // tray.setToolTip('任务列表');
    // tray.setContextMenu(contextMenu);
    // tray.on('click', () => {
    //     win.isVisible() ? win.hide() : win.show();
    // });

    // 注册快捷键按
    globalShortcut.register('CommandOrControl+Shift+D', () => {
        win.isVisible() ? win.hide() : win.show();
    });
    globalShortcut.register('Esc', () => {
        if (win.isFocused()) {
            win.hide();
        }
    });

    // 系统通知
    app.setAppUserModelId("todo.edeity.me"); // set appId from package.json
    // autoUpdater.checkForUpdatesAndNotify();
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    app.quit()
});

app.on('activate', function () {
    if (win === null) {
        createWindow()
    }
});