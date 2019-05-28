import React, { PureComponent } from 'react';
import cs from 'classnames';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import Checkbox from './common/Checkbox';

const KEYCODE = {
    ENTER: 13,
}

const STORE_KEY = '__todo-message';
const STORE_DONE_KEY = '__done-message';
const store = window.localStorage;

const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    background: isDragging && 'rgba(255, 255, 255, 0.2)',
    ...draggableStyle
});
const getListStyle = isDraggingOver => ({});

const TODO_CONIG = {
    LIMIT_WORDS: 24,
    HELLO: '不来一发吗?',
}

class App extends PureComponent {
    state = {
        message: [],
        doneMessage: [],
        tips: '',
        focus: '',
        value: '',
    }
    componentDidMount() {
        const message = JSON.parse(store.getItem(STORE_KEY)) || [];
        const doneMessage = JSON.parse(store.getItem(STORE_DONE_KEY)) || [];;
        message.forEach(function (eachMessage) {
            eachMessage.em = false;
        })
        doneMessage.forEach(function (eachMessage) {
            eachMessage.em = false;
        })
        this.setState({ message: [...message] })
        this.setState({ doneMessage: [...doneMessage] });
    }
    // 提示
    tips = (tips) => {
        this.setState({ tips });
        if (this.tipsTimout) {
            clearTimeout(this.tipsTimout);
            this.tipsTimout = null;
        }
        this.tipsTimout = setTimeout(() => {
            this.setState({ tips: '' });
        }, 2000);
    }
    // 根据输入的内容获得对应的提示
    getTips(value) {
        const { message } = this.state;
        const length = value.length;
        let findIndex = -1;
        message.some((eachMessage, index) => {
            if (eachMessage.value === value) {
                findIndex = index;
                return true;
            }
            return false;
        });
        if (length === 0) {
            return '哈哈哈，小哑巴！';
        }
        if (value.length === 1) {
            return '一个字？太吝啬了吧？';
        }
        if (message.length >= 6) {
            return '装不下啦，快去干活！';
        }
        if (findIndex !== -1) {
            this.emMsg(findIndex);
            return '你已经说过啦！真啰嗦~'
        }
    }

    /**
     * 对列表进行相关的数据操作 Start
     */
    // 插入列表
    insertMsg(value) {
        const { message } = this.state;
        const tips = this.getTips(value)
        if (tips) {
            this.tips(tips);
            return false;
        }
        message.unshift({
            value: value,
            em: true
        });
        store.setItem(STORE_KEY, JSON.stringify(message));
        this.setState({
            message: [...message]
        })
        return true;
    }
    // 强调列表
    emMsg = (index) => {
        const { message } = this.state;
        message[index].em = true;
        this.setState({
            message: [...message]
        });
        setTimeout(() => {
            message[index].em = false;
            this.setState({
                MESSAGE: [...message]
            })
        }, 2000);
    }
    // 完成或未完成列表
    checkMsg(index, value) {
        const { message, doneMessage } = this.state;
        if (value === true) {
            message[index].date = Date.now();
            doneMessage.unshift(message[index]);
            message.splice(index, 1);
        } else {
            doneMessage[index].date = null;
            message.unshift(doneMessage[index]);
            doneMessage.splice(index, 1);
        }
        this.setState({
            message: [...message],
            doneMessage: [...doneMessage],
        });
        store.setItem(STORE_KEY, JSON.stringify(message));
        store.setItem(STORE_DONE_KEY, JSON.stringify(doneMessage));
    }
    // 删除列表
    deleteMsg = (index, event) => {
        let { message } = this.state;
        message.splice(index, 1);
        store.setItem(STORE_KEY, JSON.stringify(message));
        this.setState({
            message: [...message]
        });
        event.stopPropagation();
        event.preventDefault();
    }
    // 删除已完成列表
    deleteDoneMsg = (index, event) => {
        let { doneMessage } = this.state;
        doneMessage.splice(index, 1);
        store.setItem(STORE_KEY, JSON.stringify(doneMessage));
        this.setState({
            doneMessage: [...doneMessage]
        });
        event.stopPropagation();
        event.preventDefault();
    }
    // 更改内容
    changeMsg = (index, event) => {
        // const { message } = this.state;
        // const activeMessage = message[index];
        // const input = this.refs.input;
        // input.value = activeMessage.value;
        // input.focus();
        // this.setState({
        //     value: activeMessage.value
        // });
    }
    /**
     * 对列表进行相关的数据操作 END
     */

    /**
     * 前端交互事件 START
     */
    handleKeydown = (event) => {
        if (event.nativeEvent.keyCode === KEYCODE.ENTER) {
            const input = this.refs.input;
            const success = this.insertMsg(input.value);
            if (success) {
                input.value = '';
                this.setState({
                    value: ''
                });
            }
        }
    }
    // 点击整个App
    handleClickApp = () => {
        const { message } = this.state;
        if (!message || message.length === 0) {
            this.refs.input.focus();
        }
    }
    // 终止事件派发
    handleStop = (event) => {
        event.stopPropagation();
        event.preventDefault();
    }
    // 输入框 focus
    handleInputFocus = (event) => {
        this.setState({ focus: true });
    }
    // 输入框 blur
    handleInputBlur = (event) => {
        let { message } = this.state;
        message.forEach((eachMessage) => {
            eachMessage.em = false;
        });
        this.setState({ focus: false, message: [...message] });
    }
    // 清空输入框
    handleInputEmpty = (event) => {
        const input = this.refs.input;
        input.value = '';
        input.focus();
        this.setState({
            value: ''
        });
        event.stopPropagation();
    }
    // 输入框内容发生改变
    handleInputChange = () => {
        let value = this.refs.input.value;
        if (value && value.length > TODO_CONIG.LIMIT_WORDS) {
            this.tips('无法装载更多');
            value = value.substr(0, TODO_CONIG.LIMIT_WORDS);
            this.refs.input.value = value;
           
        }  
        this.setState({ value });
    }
    // 拖拽结束
    onDragEnd = (result) => {
        const { message } = this.state;
        const { source, destination } = result;
        if (!destination) {
            return;
        }
        const sourceIndex = source.index;
        const destinationIndex = destination.index;
        const sourceMsg = message[sourceIndex];
        if (sourceIndex < destinationIndex) {
            for (let i = sourceIndex; i < destinationIndex; i++) {
                message[i] = message[i + 1];
            }
        } else if (sourceIndex > destinationIndex) {
            for (let i = sourceIndex; i > destinationIndex; i--) {
                message[i] = message[i - 1];
            }
        }
        message[destinationIndex] = sourceMsg;

        this.setState({
            message: [...message]
        });
        store.setItem(STORE_KEY, JSON.stringify(message));
    }
    /**
     * 前端交互事件 END
     */

    /**
     * 渲染部分
     */
    _renderUndoLi(index, eachMessage) {
        return (
            <Draggable
                key={index}
                index={index}
                draggableId={eachMessage + index}>
                {(provided, snapshot) => (
                    <li
                        ref={provided.innerRef}
                        className={cs({ "em": eachMessage.em })}
                        onClick={this.handleStop}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                        )}
                        onDoubleClick={
                            (event) => {
                                this.changeMsg(index, event)
                            }}>
                        <Checkbox
                            checked={false}
                            onChange={(value) => { this.checkMsg(index, value) }} />
                        <span className="message">{eachMessage.value}</span>
                        <button
                            className="cross close"
                            onClick={(event) => { this.deleteMsg(index, event) }} />
                    </li>
                )}
            </Draggable>
        )
    }

    _renderUndoList() {
        const { message, tips, focus } = this.state;
        return (
            <Droppable droppableId="todo-drop">
                {
                    (provided, snapshot) => (
                        <ul
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                            className={cs('todo-list', { "focus": focus || tips, "normal": !focus })}>
                            {
                                message && message.length === 0 &&
                                <div className="hello">{TODO_CONIG.HELLO}</div>
                            }
                            {
                                message.map((eachMessage, index) => {
                                    return this._renderUndoLi(index, eachMessage);
                                })
                            }
                        </ul>
                    )
                }
            </Droppable>
        )
    }

    _renderDoneLi(index, eachMessage) {
        return (
            <li
                key={index}
                onDoubleClick={
                    (event) => {
                        this.changeMsg(index, event)
                    }}>
                <Checkbox
                    small
                    checked={true}
                    onChange={(value) => { this.checkMsg(index, value) }} />
                <span className="message">{eachMessage.value}</span>
                <button
                    className="cross close"
                    onClick={(event) => { this.deleteDoneMsg(index, event) }} />
            </li>
        )
    }

    _renderDoneList() {
        const { doneMessage, tips, focus } = this.state;
        return (
            <ul className={cs('done-list', { "focus": focus || tips, "normal": !focus })}>
                {
                    doneMessage.length > 0 &&
                    <div className="done-split"></div>
                }
                {
                    doneMessage.map((eachMessage, index) => {
                        return this._renderDoneLi(index, eachMessage);
                    })
                }
            </ul>
        )
    }

    render() {
        const { message, tips, focus, value } = this.state;
        let status = message.length <= 1 ? 'good' : message.length <= 4 ? 'ok' : 'busy';
        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <div className="todo-app" tabIndex="0">

                    <div className="app-wrapper" onClick={this.handleClickApp}>

                        {/* 其它提示 */}
                        <div className={cs("tips", { "is-active": tips })}>{`${tips}`}</div>
                        <div className={cs('status', status)}></div>

                        {/* 列表 */}
                        <div className="list-container">
                            {this._renderUndoList()}
                            {this._renderDoneList()}
                        </div>

                        {/* 输入框 */}
                        <div className="input-wrapper">
                            <input
                                className={cs("input", { "focus": focus })} ref="input"
                                onFocus={this.handleInputFocus}
                                onBlur={this.handleInputBlur}
                                onChange={this.handleInputChange}
                                onClick={this.handleStop}
                                onKeyPress={this.handleKeydown} />
                            {
                                <button
                                    className={cs("cross close", { 'hidden': !focus || !value })}
                                    onClick={(event) => { this.handleInputEmpty(event) }} />
                            }
                        </div>
                    </div>
                </div>

            </DragDropContext>
        );
    }
}

export default App;
