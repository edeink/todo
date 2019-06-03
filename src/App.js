import React, { PureComponent } from 'react';
import cs from 'classnames';

import Category from './Component/Category';
import Tip from './Component/Tip';
import Status from './Component/Status';
import Input from './Component/Input';
import UndoList from './Component/UndoList';
import Tool, {ToolBtn} from './Component/Tool';
import Uploader, {ACCEPT_TYPE} from "./Component/Uploader";

import TODO_CONIG from './config';
import fileHelper from './tool/file';

import './app.scss';
import './icons.scss';

const store = window.localStorage;
const getStoreKey = function (category, key) {
    return `__${category}_${key}`;
};
const getData = function(key, defaultValue) {
    let data = null;
    try {
        data = JSON.parse(store.getItem(key));
    } catch (err) {

    }
    if (!data) {
        data = defaultValue;
    }
    return data;
};

class App extends PureComponent {
    state = {
        message: [], // 未完成的消息
        doneMessage: [], // 已经完成的消息
        focus: '', // input是否focus
        category: TODO_CONIG.CATEGORY, // 总分类
        categoryKey: TODO_CONIG.CATEGORY[0].key, // 当前激活的分类
        openTool: false, // 打开工具栏
    };

    storeKey = '';
    doneKey = '';

    componentDidMount() {
        this._readData();
    }

    _calcStoreKey(categoryKey) {
        this.storeKey = getStoreKey(categoryKey, TODO_CONIG.TODO_KEY);
        this.doneKey = getStoreKey(categoryKey, TODO_CONIG.DONE_KEY);
    }
    // 从持久化中读取数据
    _readData = () => {
        const category = getData(TODO_CONIG.CATEGORY_KEY, TODO_CONIG.CATEGORY);
        const categoryKey = category[0].key;
        this._calcStoreKey(categoryKey);
        this.setState({
            category,
            categoryKey,
        });
        this._readList();
    };
    _readList = () => {
        const message = getData(this.storeKey, []);
        const doneMessage = getData(this.doneKey, []);
        this.setState({
            message: [...message],
            doneMessage: [...doneMessage]
        })
    };
    /**
     * 对列表进行相关的数据操作 Start
     */
    // 插入列表
    insertMsg(value) {
        const { message } = this.state;
        const tip = Tip.getTip(value, message);
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
        });
        return true;
    }
    dragMsg = (message) => {
        this.setState({
            message: [...message]
        });
        store.setItem(this.storeKey, JSON.stringify(message));
    };
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
    };
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
    };
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
    };
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
            this._calcStoreKey(key);
            this._readList();
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
            const message = getData(tempTodoKey, []);
            const doneMessage = getData(tempDoneKey, []);
            saveObj.data[tempTodoKey] = message;
            saveObj.data[tempDoneKey] = doneMessage;
        });
        fileHelper.save('config.json', JSON.stringify(saveObj));
    };
    handleRead = (readObj) => {
        const category = readObj.category;
        const data = readObj.data;
        store.setItem(TODO_CONIG.CATEGORY_KEY, JSON.stringify(category));
        let keys = Object.keys(data);
        keys.forEach(function (eachKey) {
            store.setItem(eachKey, JSON.stringify(data[eachKey]));
        });
        this._readData();
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
        return this.insertMsg(value);
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
        const { message, doneMessage, focus, category, categoryKey, openTool } = this.state;
        return (
            <div className="todo-app" tabIndex="0">
                <div className={cs('app-wrapper', {'open-tool': openTool})}>

                    {/* 分类 */}
                    <Category activeKey={categoryKey}
                        options={category}
                        onChange={this.changeCategory} />
                    {/* 其它提示 */}
                    <Tip/>
                    {/* 当前状态栏 */}
                    <Status length={message.length} onClick={this.handleToggleTool} />
                    {/* 列表 */}
                    <div className="list-container">
                        <UndoList
                            className={cs('undo-list', { "focus": focus })}
                            list={message}
                            checked={false}
                            placeholder={"不来一发吗?"}
                            onSelect={this.checkMsg}
                            onDelete={this.deleteMsg}
                            onDrag={this.dragMsg} />
                        {
                            doneMessage.length > 0 &&
                            <div className="done-split"/>
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
                {
                    openTool &&
                    <Tool onClose={this.handleToggleTool}>
                        <ToolBtn type='download' onClick={this.handleSave}/>
                        <Uploader type={ACCEPT_TYPE.JSON} onChange={this.handleRead}>
                            <ToolBtn type='upload'/>
                        </Uploader>
                    </Tool>
                }
            </div>
        );
    }
}

export default App;
