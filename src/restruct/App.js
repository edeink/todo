import './app.scss';

import React, {PureComponent} from 'react';
import cs from "classnames";
import {DragDropContext} from "react-beautiful-dnd";
import {isWindows} from "../tool/userAgent";
import Todo from './Todo';
import ColorTheme from "../Component/Exclusive/ColorTheme";
import ToolBar from './ToolBar';
import Tip from "../Component/Exclusive/Tip";
import Confirm from "../Component/Common/Modal/Confirm";

export default class Template extends PureComponent {
    static propTypes = {};
    state = {
        theme: ColorTheme.getTheme(),
        openTool: false,
        confirmVisible: false,
        confirmText: '',
    };

    onConfirm = () => {

    };

    onConfirmCancel = () => {

    };

    handleToggleTool = () => {
        const {openTool} = this.state;
        this.setState({
            openTool: !openTool
        })
    };

    handleThemeChange = (theme) => {
        this.setState({
            theme
        });
    };

    render() {
        const {theme, openTool, confirmVisible, confirmText} = this.state;
        // 根据布局属性做判断
        let root = document.querySelector('#root');
        const isElectron = root.clientWidth === 320;
        const isChromeExtension = root.clientWidth === 310;
        return (
            <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart}>
                <div id="todo-app" className={cs(`theme-${theme}`,
                    {'is-electron': isElectron, 'is-extensions': isChromeExtension, 'is-win': isWindows})}
                     tabIndex="0">
                    <Todo openTool={openTool}/>
                    {/* 非关键Comp */}
                    {/*确认信息*/}
                    <Confirm show={confirmVisible}
                             title={confirmText}
                             onOk={this.onConfirm}
                             onCancel={this.onConfirmCancel}/>
                    <Tip/>
                    <ToolBar
                        isActive={openTool}
                        onToggle={this.handleToggleTool}
                        onChangeTheme={this.handleThemeChange}/>
                </div>
            </DragDropContext>
        )
    }
}