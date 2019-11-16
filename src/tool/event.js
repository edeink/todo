const eventHelper = {
    TYPE: {
        TIP: 'TIP', // 提示
        DELETE_CATEGORY: 'DELETE_CATEGORY', // 删除当前激活的页签
        SAVE_DATA: 'SAVE_DATA', // 保存数据
        READ_DATA: 'READ_DATA', // 读取数据
        CHANGE_THEME: 'CHANGE_THEME', // 更改样式
        DRAG_END: 'DRAG_END', // 拖拽结束
        CONFIRM: 'CONFIRM', // 弹出确认框
    },
    stop(event) {
        event.stopPropagation();
        event.preventDefault();
    },
    dispatch(type, detail = {}, bubbles = true, cancellable = true) {
        const event = document.createEvent('CustomEvent');
        event.initCustomEvent(type, bubbles, cancellable, detail);
        window.dispatchEvent(event);
    }
};

export default eventHelper;