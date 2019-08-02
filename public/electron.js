const electron = require('electron');
const path = require('path');
const url = require('url');
const IS_DEV = process.env.NODE_ENV === 'development';

const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

const {app, BrowserWindow, Menu, Tray, globalShortcut, dialog} = electron;

let win = null;
let tray = null;

// normal、separator、submenu、checkbox 或 radio
const MENU_TYPE = {
    BUTTON: 'normal',
    SEPARATOR: 'separator',
    SUBMENU: 'submenu',
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
};
const iconPath = path.join(__dirname, './img/icon18.png');
const iconClearPath = path.join(__dirname, './img/icon48.png');
const aboutMsg =
`
版本信息：v0.03 
联系作者：edeity.fly@gmail.com
了解更多：https://github.com/edeity/todo
`;
const winWidth = 320;
const winHeight = 300;

function createWindow() {
    const { width: screenWidth, height: screenHeight } = electron.screen.getPrimaryDisplay().workAreaSize;
    let initX = parseInt(screenWidth - winWidth);
    let initY = parseInt((screenHeight - winHeight) / 2);
    let isMax = false;
    // 初始化窗口
    win = new BrowserWindow({
        x: initX,
        y: initY,
        icon: iconPath,
        width: winWidth,
        height: winHeight,
        title: '便签',
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

    const trayMenu = [
        {
            label:  '隐藏', type: MENU_TYPE.BUTTON, click: function () {
                hideOrShow();
            },
            accelerator: 'CommandOrControl+Shift+D',
        },
        {
            label: '展开', type: MENU_TYPE.BUTTON, click: function () {
                maxOrMin();
            },
            accelerator: 'CommandOrControl+Shift+O',
        },
        {
            label: '显示层级', submenu: [
                {
                    label: '总是在最前', type: MENU_TYPE.RADIO, checked: true, click: function () {
                        win.show();
                        win.setAlwaysOnTop(true);
                        trayMenu[0].label = '隐藏';
                        trayMenu[2].submenu[0].checked = true;
                        trayMenu[2].submenu[1].checked = false;
                        // trayMenu[2].submenu[2].checked = false;
                        trayUpdate(trayMenu);
                    }
                },
                {
                    label: '正常层级', type: MENU_TYPE.RADIO, click: function () {
                        win.show();
                        win.setAlwaysOnTop(false);
                        trayMenu[0].label = '隐藏';
                        trayMenu[2].submenu[0].checked = false;
                        trayMenu[2].submenu[1].checked = true;
                        // trayMenu[2].submenu[2].checked = false;
                        trayUpdate(trayMenu);
                    }
                },
                // {
                //     label: '依附在桌面', type: MENU_TYPE.RADIO, click: function () {
                //         win.show();
                //         win.setAlwaysOnTop(false, -1);
                //         trayMenu[0].label = '隐藏';
                //         trayMenu[2].submenu[0].checked = false;
                //         trayMenu[2].submenu[1].checked = false;
                //         trayMenu[2].submenu[2].checked = true;
                //         trayUpdate(trayMenu);
                //     }
                // }
            ]
        },
        {
            label: '', type: MENU_TYPE.SEPARATOR
        },
        {
            label: '关于', type: MENU_TYPE.BUTTON, click: function () {
                dialog.showMessageBox({
                    type: 'none',
                    icon: iconClearPath,
                    title: '关于',
                    message: '小便签',
                    detail: aboutMsg
                })
            }
        },
        {
            label: '', type: MENU_TYPE.SEPARATOR
        },
        {
            label: '退出', type: MENU_TYPE.BUTTON, click: function (event) {
                // event存在，代表菜单点击
                if (event || win.isFocused()) {
                    win.close();
                }
            },
            accelerator: 'Esc',
        },
    ];

    function hideOrShow() {
        if (win.isVisible()) {
            win.hide();
            trayMenu[0].label = '显示';
        } else {
            win.show();
            trayMenu[0].label = '隐藏';
        }
        trayUpdate(trayMenu);
    }
    function maxOrMin() {
        if (!isMax) {
            if (isWin) {
                win.setSize(winWidth, screenHeight - 100);
                win.setPosition(parseInt(screenWidth - winWidth), 100);
            } else {
                win.setSize(winWidth, screenHeight);
                win.setPosition(parseInt(screenWidth - winWidth), 0);
            }
            trayMenu[1].label = '收起';
        } else {
            win.setResizable(true);
            win.setSize(winWidth, winHeight);
            win.setPosition(initX, initY);
            trayMenu[1].label = '展开';
            win.setResizable(false);
        }
        isMax = !isMax;
        trayUpdate(trayMenu);
    }

    function trayUpdate(trayMenu) {
        const contextMenu = Menu.buildFromTemplate(trayMenu);
        tray.setContextMenu(contextMenu);
    }


    // 系统托盘
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate(trayMenu);
    // tray.setToolTip('This is my application.');
    tray.setContextMenu(contextMenu);

    // 应用菜单
    const menu = Menu.buildFromTemplate(isMac ? trayMenu : []); // 空代表不要菜单
    Menu.setApplicationMenu(menu); // 设置菜单部分

    // 注册快捷键按
    trayMenu.forEach(function (eachTray) {
       if (eachTray.accelerator) {
           globalShortcut.register(eachTray.accelerator, eachTray.click);
       }
    });

    // 关闭注销
    win.on('closed', function () {
        win = null
    });
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