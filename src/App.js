import React, { PureComponent } from 'react';
import cs from 'classnames';

import Category from './Component/Category';
import Tip from './Component/Tip';
import Status from './Component/Status';
import Input from './Component/Input';
import UndoList from './Component/UndoList';

import TODO_CONIG from './config';

import './app.scss';

const store = window.localStorage;

class App extends PureComponent {
    state = {
        message: [], // 未完成的消息
        doneMessage: [], // 已经完成的消息
        focus: '', // input是否focus
        value: '', // 当前输入的值
        category: TODO_CONIG.CATEGORY, // 总分类
        categoryKey: TODO_CONIG.CATEGORY[0].key, // 当前激活的分类
    }

    storeKey = '';
    doneKey = '';

    componentDidMount() {
        this._calcStoreKey();
        this._readData();
    }
    // 计算存储的值
    _calcStoreKey() {
        const { categoryKey } = this.state;
        this.storeKey = `__${categoryKey}_${TODO_CONIG.TODO_KEY}`;
        this.doneKey = `__${categoryKey}_${TODO_CONIG.DONE_KEY}`;
    }
    // 从持久化中读取数据
    _readData = () => {
        const message = JSON.parse(store.getItem(this.storeKey)) || [];
        const doneMessage = JSON.parse(store.getItem(this.doneKey)) || [];;
        this.setState({ message: [...message] })
        this.setState({ doneMessage: [...doneMessage] });
    }
    /**
     * 对列表进行相关的数据操作 Start
     */
    // 插入列表
    insertMsg(value) {
        const { message } = this.state;
        const tip = Tip.getTip(value, message)
        if (tip) {
            Tip.showTip(tip);
            return false;
        }
        message.unshift({
            value: value,
        });
        store.setItem(this.storeKey, JSON.stringify(message));
        this.setState({
            message: [...message]
        })
        return true;
    }
    dragMsg = (message) => {
        this.setState({
            message: [...message]
        });
        store.setItem(this.storeKey, JSON.stringify(message));
    }
    // 完成或未完成列表
    checkMsg = (index, value) => {
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
        store.setItem(this.storeKey, JSON.stringify(message));
        store.setItem(this.doneKey, JSON.stringify(doneMessage));
    }
    // 删除列表
    deleteMsg = (index, event) => {
        let { message } = this.state;
        message.splice(index, 1);
        store.setItem(this.storeKey, JSON.stringify(message));
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
        store.setItem(this.storeKey, JSON.stringify(doneMessage));
        this.setState({
            doneMessage: [...doneMessage]
        });
        event.stopPropagation();
        event.preventDefault();
    }
    /**
     * 对列表进行相关的数据操作 END
     */

    /**
     * 前端交互事件 START
     */
    changeCategory = (key) => {
        this.setState({
            categoryKey: key
        }, () => {
            this._calcStoreKey();
            this._readData();
        });
    }
    // 输入框 focus
    handleInputFocus = (event) => {
        this.setState({ focus: true });
    }
    // 输入框 blur
    handleInputBlur = (event) => {
        this.setState({ focus: false });
    }
    handleInputEnter = (value) => {
        return this.insertMsg(value);
    }

    /**
     * 前端交互事件 END
     */

    render() {
        const { message, doneMessage, focus, value, category, categoryKey } = this.state;
        return (
            <div className="todo-app" tabIndex="0">
                <div className="app-wrapper">

                    <Category activeKey={categoryKey}
                        options={category}
                        onChange={this.changeCategory} />

                    {/* 其它提示 */}
                    <Tip />
                    <Status length={message.length} />


                    {/* 列表 */}
                    <div className="list-container">
                        <UndoList
                            className={cs('undo-list', { "focus": focus })}
                            list={message}
                            checked={false}
                            placeholder={"不来一发吗?"}
                            onSelect={this.checkMsg}
                            onDelete={this.deleteMsg} 
                            onDrag={this.dragMsg}/>
                        {
                            doneMessage.length > 0 &&
                            <div className="done-split"></div>
                        }
                        <UndoList
                            className={cs('done-list', { "focus": focus })}
                            checked small
                            list={doneMessage}
                            onSelect={this.checkMsg}
                            onDelete={this.deleteDoneMsg} />
                    </div>

                    {/* 输入框 */}
                    <Input
                        className={cs({ "focus": focus })}
                        max={TODO_CONIG.LIMIT_WORDS}
                        onFocus={this.handleInputFocus}
                        onBlur={this.handleInputBlur}
                        onEnter={this.handleInputEnter} />
                </div>
            </div>
        );
    }
}

export default App;
