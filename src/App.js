import './app.scss';
import './icon/icons.scss';

import React, {PureComponent} from 'react';
import cs from 'classnames';
import {DragDropContext} from "react-beautiful-dnd";
import Tip from './Component/Exclusive/Tip';
import ColorTheme from './Component/Exclusive/ColorTheme';
import ToolBar from "./Component/Exclusive/Toolbar";
import {isWindows} from './tool/userAgent';

import Confirm from "./Component/Common/Modal/Confirm";
import eventHelper from "./tool/event";
import Todo from "./Component/Exclusive/Todo";

class App extends PureComponent {
    state = {
        openTool: false, // 打开工具栏
        theme: ColorTheme.getTheme(), // THEME.DEFAULT,
        confirmVisible: false,
        confirmCallback: null,
        confirmText: '',
    };

    componentDidMount() {
        window.addEventListener(eventHelper.TYPE.CHANGE_THEME, this.handleThemeChange);
        window.addEventListener(eventHelper.TYPE.CONFIRM, this.showConfirm);
    }

    componentWillUnmount() {
        window.removeEventListener(eventHelper.TYPE.CHANGE_THEME, this.handleThemeChange);
        window.addEventListener(eventHelper.TYPE.CONFIRM, this.showConfirm);
    }

    onDragEnd(result) {
        eventHelper.dispatch(eventHelper.TYPE.DRAG_END, {result})
    }

    handleToggleTool = () => {
        const {openTool} = this.state;
        this.setState({
            openTool: !openTool
        })
    };

    handleThemeChange = (event) => {
        const {theme} = event.detail;
        this.setState({
            theme
        });
    };

    showConfirm = (event) => {
        const {text: confirmText, ensure: confirmCallback} = event.detail;
        this.setState({
            confirmText,
            confirmCallback,
            confirmVisible: true,
        })
    };

    onConfirm = () => {
        const {confirmCallback} = this.state;
        const result = confirmCallback && confirmCallback();
        if (result !== false) {
            this.onConfirmCancel();
        }
    };

    // 取消
    onConfirmCancel = () => {
        this.setState({
            confirmVisible: false,
            confirmText: '',
        });
    };

    /**
     * 前端交互事件 END
     */

    render() {
        const {
            theme, openTool,
            confirmVisible, confirmText,
        } = this.state;
        let root = document.querySelector('#root');
        // 根据布局属性做判断
        const isElectron = root.clientWidth === 320;
        const isChromeExtension = root.clientWidth === 310;
        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <div id="todo-app" className={cs(`theme-${theme}`,
                    {'is-electron': isElectron, 'is-extensions': isChromeExtension, 'is-win': isWindows})}
                     tabIndex="0">
                   <Todo openTool={openTool}/>
                    {/*确认信息*/}
                    <Confirm show={confirmVisible}
                             title={confirmText}
                             onOk={this.onConfirm}
                             onCancel={this.onConfirmCancel}/>
                    {/* 其它提示 */}
                    <Tip/>
                    {/* 工具栏 */}
                    <ToolBar isActive={openTool}
                             onToggleTool={this.handleToggleTool}/>
                    {/*<Calendar/>*/}
                </div>
            </DragDropContext>
        );
    }
}

export default App;
