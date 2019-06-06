import React, { PureComponent } from 'react';
import cs from 'classnames';

import Category from './Component/Category';
import Tip from './Component/Tip';
import Status from './Component/Status';
import Input from './Component/Input';
import UndoList from './Component/UndoList';
import Tool, {ToolBtn} from './Component/Tool';
import Uploader, {ACCEPT_TYPE} from "./Component/Uploader";
import ToolTip from './Component/ToolTip';

import TODO_CONIG from './config';
import fileHelper from './tool/file';
import {stringify, parse} from './tool/json';

import './app.scss';
import './icons.scss';
import parser from "./tool/parser";

const store = window.localStorage;
const getStoreKey = function (category, key) {
    return `__${category}_${key}`;
};

class App extends PureComponent {
    state = {
        message: [], // 未完成的消息
        doneMessage: [], // 已经完成的消息
        focus: '', // input是否focus
        category: TODO_CONIG.CATEGORY, // 总分类
        categoryKey: TODO_CONIG.CATEGORY[0].key, // 当前激活的分类
        openTool: false, // 打开工具栏
        enableAnimate: false, // 禁用动画
    };

    storeKey = '';
    doneKey = '';

    componentDidMount() {
        this._readData(() => {
            this.brieflyCloseAnimate();
        });
    }

    _calcStoreKey(categoryKey) {
        this.storeKey = getStoreKey(categoryKey, TODO_CONIG.TODO_KEY);
        this.doneKey = getStoreKey(categoryKey, TODO_CONIG.DONE_KEY);
    }
    // 从持久化中读取数据
    _readData = (callback) => {
        const category = parse(store.getItem(TODO_CONIG.CATEGORY_KEY), TODO_CONIG.CATEGORY);
        const categoryKey = category[0].key;
        this._calcStoreKey(categoryKey);
        this.setState({
            category,
            categoryKey,
            openTool: false,
        });
        this._readList(callback);
    };
    _readList = (callback) => {
        const message = parse(store.getItem(this.storeKey), []);
        const doneMessage = parse(store.getItem(this.doneKey), []);
        message.forEach(function (eachMsg) {
            if (!eachMsg.__parseData) {
                eachMsg.__parseData = parser.parse(eachMsg.value);
            }
        });
        doneMessage.forEach(function (eachMsg) {
            if (!eachMsg.__parseData) {
                eachMsg.__parseData = parser.parse(eachMsg.value);
            }
        });
        this.setState({
            message: [...message],
            doneMessage: [...doneMessage]
        }, function () {
            callback && callback();
        })
    };
    /**
     * 对列表进行相关的数据操作 Start
     */
    // 插入列表
    insertMsg(msg) {
        const { message } = this.state;
        const newMessage = [...message];
        const tip = Tip.getTip(msg, message);
        if (tip) {
            Tip.showTip(tip);
            return false;
        }
        msg.__parseData = parser.parse(msg.value);
        newMessage.unshift(msg);
        store.setItem(this.storeKey, stringify(newMessage));
        this.setState({
            message: newMessage
        });
        return true;
    }
    dragMsg = (message) => {
        let newMessage = [...message];
        this.setState({
            message: newMessage
        });
        store.setItem(this.storeKey, stringify(newMessage));
    };
    // 完成或未完成列表
    checkMsg = (index, value) => {
        const { message, doneMessage } = this.state;
        let newMessage = [...message];
        let newDoneMessage = [...doneMessage];
        if (value === true) {
            newMessage[index].date = Date.now();
            newDoneMessage.unshift(newMessage[index]);
            newMessage.splice(index, 1);
        } else {
            newDoneMessage[index].date = null;
            newMessage.unshift(newDoneMessage[index]);
            newDoneMessage.splice(index, 1);
        }
        this.setState({
            message: newMessage,
            doneMessage: newDoneMessage
        });
        store.setItem(this.storeKey, stringify(newMessage));
        store.setItem(this.doneKey, stringify(newDoneMessage));
    };
    // 删除列表
    deleteMsg = (index, event) => {
        const { message } = this.state;
        let newMessage = [...message];
        newMessage.splice(index, 1);
        store.setItem(this.storeKey, stringify(newMessage));
        this.brieflyCloseAnimate();
        this.setState({
            message: newMessage
        });
    };
    // 删除已完成列表
    deleteDoneMsg = (index, event) => {
        let { doneMessage } = this.state;
        let newMessage = [...doneMessage];
        newMessage.splice(index, 1);
        store.setItem(this.storeKey, stringify(newMessage));
        this.setState({
            doneMessage: newMessage
        });
    };
    /**
     * 对列表进行相关的数据操作 END
     */

    /**
     * 前端交互事件 START
     */
    // 短暂关闭动画
    brieflyCloseAnimate = () => {
        this.setState({
            enableAnimate: false,
        });
        setTimeout(() => {
            this.setState({
                enableAnimate: true,
            })
        }, 100);
    };
    changeCategory = (key) => {
        this.setState({
            categoryKey: key,
        }, () => {
            this._calcStoreKey(key);
            this._readList();
            this.brieflyCloseAnimate();
        });
    };
    handleSave = () => {
        const { category } = this.state;
        let saveObj = {};
        saveObj.category = category;
        saveObj.data = {};
        category.forEach((eachCategory) => {
            const { key } = eachCategory;
            const tempTodoKey = getStoreKey(key, TODO_CONIG.TODO_KEY);
            const tempDoneKey = getStoreKey(key, TODO_CONIG.DONE_KEY);
            const message = parse(store.getItem(tempTodoKey), []);
            const doneMessage = parse(store.getItem(tempDoneKey), []);
            saveObj.data[tempTodoKey] = message;
            saveObj.data[tempDoneKey] = doneMessage;
        });
        fileHelper.save('config.json', stringify(saveObj));
    };
    handleRead = (readObj) => {
        const category = readObj.category;
        const data = readObj.data;
        store.setItem(TODO_CONIG.CATEGORY_KEY, stringify(category));
        let keys = Object.keys(data);
        keys.forEach(function (eachKey) {
            store.setItem(eachKey, stringify(data[eachKey]));
        });
        this._readData(function () {
            Tip.showTip('读取成功')
        });
    };
    // 输入框 focus
    handleInputFocus = () => {
        this.setState({ focus: true });
    };
    // 输入框 blur
    handleInputBlur = () => {
        this.setState({ focus: false });
    };
    handleInputEnter = (value) => {
        return this.insertMsg({
            value
        });
    };
    handleToggleTool = () => {
        const { openTool } = this.state;
        this.setState({
            openTool: !openTool
        })
    };
    /**
     * 前端交互事件 END
     */
    render() {
        const { message, doneMessage, focus, category, categoryKey, openTool, enableAnimate } = this.state;
        return (
            <div id="todo-app" tabIndex="0">
                <div className={cs('app-wrapper', {'open-tool': openTool})}>

                    {/* 分类 */}
                    <Category activeKey={categoryKey}
                        options={category}
                        onChange={this.changeCategory} />
                    {/* 其它提示 */}
                    <Tip/>
                    {/* 当前状态栏 */}
                    <Status length={message.length} onClick={this.handleToggleTool} isActive={openTool}/>
                    {/* 列表 */}
                    <div className={cs('list-container', {'focus': focus})}>
                        <UndoList
                            id='undo'
                            className={cs('undo-list')}
                            list={message}
                            checked={false}
                            placeholder={"不来一发吗?"}
                            transitionEnter={enableAnimate}
                            transitionLeave={enableAnimate}
                            onSelect={this.checkMsg}
                            onDelete={this.deleteMsg}
                            onDrag={this.dragMsg} />
                        {
                            doneMessage.length > 0 &&
                            <div className="done-split"/>
                        }
                        <UndoList
                            id='done'
                            className={cs('done-list')}
                            checked small
                            list={doneMessage}
                            enterActive={'bounceInLeft'}
                            transitionEnter={enableAnimate}
                            transitionLeave={false}
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
                <Tool isActive={openTool} onClose={this.handleToggleTool}>
                    <ToolTip title="导出配置">
                        <ToolBtn type='download' onClick={this.handleSave}/>
                    </ToolTip>
                    <ToolTip title="导入配置">
                        <Uploader type={ACCEPT_TYPE.JSON} onChange={this.handleRead}>
                            <ToolBtn type='upload'/>
                        </Uploader>
                    </ToolTip>
                </Tool>
            </div>
        );
    }
}

export default App;
