const electron = require('electron');
const path = require('path');
const url = require('url');
const IS_DEV = process.env.NODE_ENV === 'development';

const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

const {app, BrowserWindow, Menu, Tray, globalShortcut, dialog} = electron;

// 按钮类型：normal、separator、submenu、checkbox 或 radio
const MENU_TYPE = {
    BUTTON: 'normal',
    SEPARATOR: 'separator',
    SUBMENU: 'submenu',
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
};

// 图片资源
const iconPath = path.join(__dirname, './img/icon18.png');
const iconMacPathBlack = path.join(__dirname, './img/icon18_mac_black.png');
const iconMacPathWhite = path.join(__dirname, './img/icon18_mac_white.png');
const iconClearPath = path.join(__dirname, './img/icon48.png');

// 关于信息
const aboutMsg =
    `
版本信息：v0.03 
联系作者：edeity.fly@gmail.com
了解更多：https://github.com/edeity/todo
`;

// 尺寸常量
const winWidth = 320;
const winHeight = 300;

class TodoApp {

    constructor() {
        app.on('ready', () => {
            this.init();
        });
    }

    init() {
        this.initFrame();
        this.initReactApp();
        this.initTrayMenu();
        this.initMenu();
        this.initEventListener();
        // 优先最大化
        this._maxOrMin();
    }

    // 加载外壳
    initFrame() {
        // 初始化窗口
        const {width: screenWidth, height: screenHeight} = electron.screen.getPrimaryDisplay().workAreaSize;
        let initX = parseInt(screenWidth - winWidth);
        let initY = parseInt((screenHeight - winHeight) / 2);
        this.win = new BrowserWindow({
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
        this.screenRect = {
            left: initX,
            top: initY,
            clientWidth: screenWidth,
            clientHeight: screenHeight,
        };
    }

    // 加载应用
    initReactApp() {
        const staticIndexPath = path.join(__dirname, '../build/index.html');
        const main = IS_DEV ? `http://localhost:3000` : url.format({
            pathname: staticIndexPath,
            protocol: 'file:',
            slashes: true
        });
        return this.win.loadURL(main);

        // IS_DEV && win.webContents.openDevTools()
    }

    initTrayMenu() {
        this.trayMenu = [
            {
                label: '隐藏', type: MENU_TYPE.BUTTON, click: () => {
                    this._hideOrShow();
                },
                accelerator: 'CommandOrControl+Shift+D',
            },
            {
                label: '展开', type: MENU_TYPE.BUTTON, click: () => {
                    this._maxOrMin();
                },
                accelerator: 'CommandOrControl+Shift+O',
            },
            {
                label: '显示层级', submenu: [
                    {
                        label: '总在最前', type: MENU_TYPE.RADIO, checked: true, click: () => {
                            this.win.show();
                            this.win.setAlwaysOnTop(true);
                            this.trayMenu[0].label = '隐藏';
                            this.trayMenu[2].submenu[0].checked = true;
                            this.trayMenu[2].submenu[1].checked = false;
                            this._trayUpdate(this.trayMenu);
                        }
                    },
                    {
                        label: '正常层级', type: MENU_TYPE.RADIO, click: () => {
                            this.win.show();
                            this.win.setAlwaysOnTop(false);
                            this.trayMenu[0].label = '隐藏';
                            this.trayMenu[2].submenu[0].checked = false;
                            this.trayMenu[2].submenu[1].checked = true;
                            this._trayUpdate(this.trayMenu);
                        }
                    },
                ]
            },
            {
                label: '', type: MENU_TYPE.SEPARATOR
            },
            {
                label: '关于', type: MENU_TYPE.BUTTON, click: () => {
                    return dialog.showMessageBox({
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
                label: '退出', type: MENU_TYPE.BUTTON, click: (event) => {
                    // event存在，代表菜单点击
                    if (event || this.win.isFocused()) {
                        this.win.close();
                    }
                },
                accelerator: 'Esc',
            },
        ];

        // 系统托盘
        this.tray = new Tray(isMac ? iconMacPathBlack : iconPath);
        const contextMenu = Menu.buildFromTemplate(this.trayMenu);
        // tray.setToolTip('This is my application.');
        this.tray.setContextMenu(contextMenu);
        if (isMac) {
            this.tray.setPressedImage(iconMacPathWhite);
        }

        // 注册快捷键按
        this.trayMenu.forEach(function (eachTray) {
            if (eachTray.accelerator) {
                globalShortcut.register(eachTray.accelerator, eachTray.click);
            }
        });
    }

    initMenu() {
        // 应用菜单
        const menu = Menu.buildFromTemplate(isMac ? this.trayMenu : []); // 空代表不要菜单
        Menu.setApplicationMenu(menu); // 设置菜单部分
    }

    // 通用监听
    initEventListener() {
        // 关闭注销
        this.win.on('closed', () => {
            this.win = null
        });

        app.on('window-all-closed', () => {
            app.quit()
        });

        app.on('activate', () => {
            if (this.win === null) {
                this.init();
            }
        });
    }

    // 更新菜单
    _trayUpdate(trayMenu) {
        const contextMenu = Menu.buildFromTemplate(trayMenu);
        this.tray.setContextMenu(contextMenu);
    }

    // 隐藏或打开面板
    _hideOrShow() {
        if (this.win.isVisible()) {
            this.win.hide();
            this.trayMenu[0].label = '显示';
        } else {
            this.win.show();
            this.trayMenu[0].label = '隐藏';
        }
        this._trayUpdate(this.trayMenu);
    }

    // 最小或最大化
    _maxOrMin() {
        if (!this.win.isVisible()) {
            this._hideOrShow();
        }
        if (!this.isMax) {
            // 展开
            if (isWin) {
                this.win.setSize(winWidth, this.screenRect.clientHeight - 100);
                this.win.setPosition(parseInt(this.screenRect.clientWidth - winWidth), 100);
            } else {
                this.win.setSize(winWidth, this.screenRect.clientHeight - 110);
                this.win.setPosition(parseInt(this.screenRect.clientWidth - winWidth), 130);
            }
            this.trayMenu[1].label = '收起';
        } else {
            // 收起
            this.win.setResizable(true);
            this.win.setSize(winWidth, winHeight);
            this.win.setPosition(this.screenRect.left, this.screenRect.top);
            this.trayMenu[1].label = '展开';
            this.win.setResizable(false);
        }
        this.isMax = !this.isMax;
        this._trayUpdate(this.trayMenu);
    }
}

new TodoApp();