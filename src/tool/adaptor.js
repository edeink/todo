// 通知
const notify = (title, body) => {
    console.log('通知：', title, body);
    new Notification(title, {
        body,
    });
};

// 跳转URL
const goToUrl = (url, errCb) => {
    try {
        const { shell } = window.require('electron');
        shell.openExternal(url);
    } catch (e) {
        try {
            window.open(url, '_blank');
        } catch (e) {
            errCb && errCb();
        }
    }
};

export {notify, goToUrl};