import React, {PureComponent} from 'react';
import cs from 'classnames';
import {DragDropContext} from "react-beautiful-dnd";
import Category from './Component/Exclusive/Category';
import Tip from './Component/Exclusive/Tip';
import Status from './Component/Exclusive/Status';
import Input from './Component/Exclusive/Input';
import UndoList from './Component/Exclusive/UndoList';
import Tool, {ToolBtn} from './Component/Exclusive/Tool';
import Uploader, {ACCEPT_TYPE} from "./Component/Common/Uploader";
import ColorTheme from './Component/Exclusive/ColorTheme';
import ToolTip from './Component/Common/ToolTip';

import TODO_CONFIG from './config';
import fileHelper from './tool/file';
import {stringify, parse, copy} from './tool/json';

import './app.scss';
import './icon/icons.scss';
import parser from "./tool/parser";
import {DROP_TYPE} from "./tool/drag";
import Confirm from "./Component/Common/Modal/Confirm";
import FilterTags from "./Component/Exclusive/FilterTags";


const store = window.localStorage;

const ANIMATE = {
    INSERT_TODO: 'bounceIn',
    INSERT_DONE: 'slideInDown',
};

// 从配置中读取信息
const {
    CATEGORY_LIST, LIMIT_WORDS, STORE_TODO_KEY,
    STORE_DONE_KEY, STORE_CATEGORY_KEY, STORE_ACTIVE_CATEGORY_KEY,
    RENDER_ACTIVE_KEY, RENDER_PARSE_KEY, RENDER_STRING_KEY,
    RENDER_TAGS_KEY, RENDER_TIME_KEY
} = TODO_CONFIG;
const LIST_KEYS = [STORE_TODO_KEY, STORE_DONE_KEY];
const INIT_CATEGORY_KEY = CATEGORY_LIST[0].key;

// 性能打桩
const TIME_KEY = {
    TEST_PARSER: '【解析数据】解析输入文本耗时：',
    ALL_DATA_READ_AND_RENDER: '【所有数据】读取 & 渲染耗时：',
    ALL_LIST_READ_AND_RENDER: '【列表数据】读取 & 渲染耗时：',
};

const getRealStoreKey = function (category, key) {
    return `__${category}_${key}`;
};

const getAntiStoreKey = function (storeKey) {
    return storeKey === STORE_TODO_KEY ? STORE_DONE_KEY : STORE_TODO_KEY;
};

class App extends PureComponent {
    state = {
        [STORE_TODO_KEY]: [], // 未完成的消息
        [STORE_DONE_KEY]: [], // 已经完成的消息
        focus: false, // input是否focus
        category: CATEGORY_LIST, // 总分类
        categoryKey: INIT_CATEGORY_KEY, // 当前激活的分类
        openTool: false, // 打开工具栏
        enableAnimate: false, // 禁用动画
        todoEnterAnimate: '',
        theme: ColorTheme.getTheme(), // THEME.DEFAULT,
        insertValue: '',
        confirmVisible: false,
        confirmText: '',
        tags: [], // 当前分类拥有的Tag
        filterTag: [], // 需要过滤的tag
    };

    componentDidMount() {
        this._readData().then(this.brieflyCloseAnimate);
    }

    __testRender() {
        // console.time(TIME_KEY.TEST_PARSER);
        // const str = '>2d 13:20 [A, B] 所有的[格式](www.baidu.com) *能* **否** ***正*** `常` ~~展~~ 示？';
        // const testTimes = 100;
        // for(let i=0; i< testTimes; i++) {
        //     parser.parse(str);
        // }
        // for(let i = 0; i< testTimes; i++) {
        //     setTimeout(() => {
        //         return this.insertOneData({
        //             value: i + str + i
        //         }, STORE_DONE_KEY, false);
        //     }, 100 * i);
        // }
        // console.timeEnd(TIME_KEY.TEST_PARSER);
    }

    // 从持久化中读取数据
    _readData = () => {
        return new Promise((resolve) => {
            console.time(TIME_KEY.ALL_DATA_READ_AND_RENDER);
            const category = parse(store.getItem(STORE_CATEGORY_KEY), CATEGORY_LIST);
            store.setItem(STORE_CATEGORY_KEY, JSON.stringify(category));
            const categoryKey = store.getItem(STORE_ACTIVE_CATEGORY_KEY) || category[0].key;
            console.time(TIME_KEY.ALL_LIST_READ_AND_RENDER);
            this.setState({
                category,
                categoryKey,
                openTool: false,
            }, () => {
                this._readList().then(() => {
                    resolve();
                    console.timeEnd(TIME_KEY.ALL_DATA_READ_AND_RENDER);
                    console.timeEnd(TIME_KEY.ALL_LIST_READ_AND_RENDER);
                });
            });
        });
    };

    // 读取每列数据
    _readList = () => {
        return new Promise((resolve) => {
            const {categoryKey} = this.state;
            const newTags = new Set();
            LIST_KEYS.forEach((eachKey) => {
                const storeKey = getRealStoreKey(categoryKey, eachKey);
                const tempData = parse(store.getItem(storeKey), []);
                tempData.forEach(function (eachData) {
                    if (!eachData[RENDER_PARSE_KEY]) {
                        eachData[RENDER_PARSE_KEY] = parser.parse(eachData.value);
                        // 一般通用数据都放在第一条数据上
                        const firstRenderData = eachData[RENDER_PARSE_KEY][0];
                        eachData[RENDER_STRING_KEY] = firstRenderData[RENDER_STRING_KEY];
                        eachData[RENDER_TAGS_KEY] = firstRenderData[RENDER_TAGS_KEY];
                        eachData[RENDER_TIME_KEY] = eachData[RENDER_TIME_KEY] || firstRenderData[RENDER_TIME_KEY];
                        eachData[RENDER_TAGS_KEY].forEach(function (eachTag) {
                            newTags.add(eachTag);
                        });
                    }
                });
                this.setState({
                    [eachKey]: tempData,
                    tags: Array.from(newTags),
                });
            });
            resolve();
        });
    };

    /**
     * 对列表进行相关的数据操作 Start
     */
    insertOneData = (data, storeKey, isEnter) => {
        if (!data || data.value === '') {
            Tip.showTip('输入不可为空');
            return false;
        }

        const {categoryKey, tags} = this.state;
        const preData = this.state[storeKey];

        // 解析该行命令
        const newData = [...preData];

        if (!data[RENDER_PARSE_KEY]) {
            data[RENDER_PARSE_KEY] = parser.parse(data.value);
        }
        // 假如之前是激活状态，则不再激活该list（作用域切换）
        if (data[RENDER_ACTIVE_KEY] === true) {
            data[RENDER_ACTIVE_KEY] = false;
        }
        if (!data[RENDER_STRING_KEY]) {
            const firstRenderData = data[RENDER_PARSE_KEY][0];
            data[RENDER_STRING_KEY] = firstRenderData[RENDER_STRING_KEY];
            data[RENDER_TAGS_KEY] = firstRenderData[RENDER_TAGS_KEY];
            data[RENDER_TIME_KEY] = firstRenderData[RENDER_TIME_KEY];
        }

        // 校验数据是否合法
        const {tip, index} = Tip.getTip(data[RENDER_STRING_KEY], newData, !isEnter);
        if (tip) {
            Tip.showTip(tip);
            if (index >= 0) {
                this.handleActive(index, storeKey, true);
            }
            return false;
        }
        if (isEnter === true) {
            const antiStoreKey = getAntiStoreKey(storeKey);
            const antiData = this.state[antiStoreKey];
            const {tip: antiTip, index} = Tip.getTip(data[RENDER_STRING_KEY], antiData, true);
            if (antiTip) {
                Tip.showTip(antiTip);
                if (index >= 0) {
                    this.handleActive(index, antiStoreKey, true);
                }
                return false;
            }
        }

        // 更改数据
        newData.unshift(data);
        // 添加新的Tags
        const newTags = new Set(tags);
        data[RENDER_TAGS_KEY].forEach(function (tag) {
            newTags.add(tag);
        });
        const realStoreKey = getRealStoreKey(categoryKey, storeKey);
        store.setItem(realStoreKey, stringify(newData));
        this.setState({
            [storeKey]: newData,
            tags: Array.from(newTags)
        });
        return true;
    };

    // 完成或未完成列表
    toggleOneData = (index, value, storeKey) => {
        const preData = this.state[storeKey];
        const antiKey = getAntiStoreKey(storeKey);
        const deleteOneData = preData[index];
        if (this.insertOneData(deleteOneData, antiKey)) {
            this.deleteOneData(index, storeKey, true);
        }
    };

    // 删除列表
    deleteOneData = (index, storeKey, enableAnimate, showConfirm) => {
        // 是否弹出删除按钮
        this.preDeleteTime = this.preDeleteTime || 0;
        let minIntervalTime = 1000 * 60 * 5; // 五分钟
        if (showConfirm === true && Date.now() - this.preDeleteTime > minIntervalTime) {
            this.onConfirm = () => {
                this.setState({
                    confirmVisible: false,
                    confirmText: '',
                });
                this.deleteOneData(index, storeKey, enableAnimate);
                this.preDeleteTime = Date.now();
            };
            this.onConfirmCancel = () => {
                this.setState({
                    confirmVisible: false,
                    confirmText: '',
                });
                this.preDeleteTime = Date.now();
            };
            this.setState({
                confirmVisible: true,
                confirmText: '是否确认删除',
            });
            return false;
        }
        const {categoryKey} = this.state;
        const preData = this.state[storeKey];
        const newData = [...preData];
        newData.splice(index, 1);
        const realStoreKey = getRealStoreKey(categoryKey, storeKey);
        store.setItem(realStoreKey, stringify(newData));
        if (enableAnimate !== true) {
            this.brieflyCloseAnimate();
        }
        this.setState({
            [storeKey]: newData
        });
    };

    dragData = (listData, storeKey) => {
        const {categoryKey} = this.state;
        this.setState({
            [storeKey]: [...listData]
        });
        const realStoreKey = getRealStoreKey(categoryKey, storeKey);
        store.setItem(realStoreKey, stringify(listData));
    };

    onInsertTag = (tag) => {
        const {insertValue} = this.state;
        // 不重复才添加
        if (insertValue.indexOf(`[${tag}]`) === -1) {
            this.setState({
                insertValue: `[${tag}]${insertValue}`
            });
        } else {
            Tip.showTip('不可添加重复的标签');
        }
    };

    changeFilter = (filterTag) => {
        this.setState({
            filterTag
        })
    };

    onDragStart = () => {
        document.activeElement && document.activeElement.blur();
    }

    onDragEnd = (result) => {
        const {source, destination} = result;
        if (!destination) {
            return;
        }
        const todoData = this.state[STORE_TODO_KEY];
        const sourceIndex = source.index;
        const sourceMsg = todoData[sourceIndex];

        switch (destination.droppableId) {
            case DROP_TYPE.TODO: {
                const newList = [...todoData];
                const destinationIndex = destination.index;
                // 根据拖拽结果调整数据顺序
                if (sourceIndex < destinationIndex) {
                    for (let i = sourceIndex; i < destinationIndex; i++) {
                        newList[i] = newList[i + 1];
                    }
                } else if (sourceIndex > destinationIndex) {
                    for (let i = sourceIndex; i > destinationIndex; i--) {
                        newList[i] = newList[i - 1];
                    }
                }
                newList[destinationIndex] = sourceMsg;
                this.dragData(newList, STORE_TODO_KEY);
                break;
            }
            case DROP_TYPE.INPUT: {
                this.setState({
                   insertValue: sourceMsg.value
                }, () => {
                    this.deleteOneData(sourceIndex, STORE_TODO_KEY, false);
                });
                break;
            }
            default: break;
        }
    };
    /**
     * 对列表进行相关的数据操作 END
     */

    /**
     * 前端交互事件 START
     */
        // 摇动一个数据以引起别人注意
    handleActive = (index, storeKey, tempShake) => {
        const preData = this.state[storeKey];
        const newData = copy(preData);
        let tempData = newData[index];
        tempData[RENDER_ACTIVE_KEY] = true;
        this.setState({
            [storeKey]: [...newData]
        });
        if (tempShake === true) {
            setTimeout(() => {
                this.brieflyCloseAnimate();
                let newTempData = copy(tempData);
                newTempData[RENDER_ACTIVE_KEY] = false;
                newData[index] = newTempData;
                this.setState({
                    [storeKey]: [...newData]
                })
            }, 1000);
        }
    };
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
            store.setItem(STORE_ACTIVE_CATEGORY_KEY, key);
            this._readList();
            this.brieflyCloseAnimate();
        });
    };
    handleSave = () => {
        const {category} = this.state;
        let saveObj = {};
        saveObj.category = category;
        saveObj.data = {};
        category.forEach((eachCategory) => {
            const {key} = eachCategory;
            LIST_KEYS.forEach(function (eachKey) {
                const tempStoreKey = getRealStoreKey(key, eachKey);
                saveObj.data[tempStoreKey] = parse(store.getItem(tempStoreKey), []);
            });
        });
        fileHelper.save('config.json', JSON.stringify(saveObj));
    };
    handleRead = (readObj) => {
        const category = readObj.category;
        const data = readObj.data;
        store.setItem(STORE_CATEGORY_KEY, JSON.stringify(category));
        let keys = Object.keys(data);
        keys.forEach(function (eachKey) {
            store.setItem(eachKey, stringify(data[eachKey]));
        });
        this._readData().then(function () {
            Tip.showTip('读取成功')
        });
    };
    handleInputFocus = () => {
        this.setState({focus: true});
    };
    handleInputBlur = () => {
        this.setState({focus: false});
    };
    handleInputEnter = (value) => {
        return this.insertOneData({
            value
        }, STORE_TODO_KEY, true);
    };
    handleInputChange = (value) => {
        this.setState({
            insertValue: value
        })
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

    /**
     * 前端交互事件 END
     */

    render() {
        const {
            focus, category, categoryKey, openTool,
            enableAnimate, todoEnterAnimate, theme,
            insertValue, confirmVisible, confirmText,
            tags, filterTag,
        } = this.state;
        const todoData = this.state[STORE_TODO_KEY];
        const doneData = this.state[STORE_DONE_KEY];
        const isSmall = document.querySelector('body').clientWidth <= 310;
        return (
            <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart}>
                <div id="todo-app" className={cs(`theme-${theme}`, {'is-small': isSmall})} tabIndex="0">
                    <div className={cs('app-wrapper', {'open-tool': openTool})}>
                        {/* 其它提示 */}
                        <Tip/>
                        {/* 当前状态栏 */}
                        <Status length={todoData.length} onClick={this.handleToggleTool}
                                isActive={openTool}/>
                        {/* 列表 */}
                        <div className={cs('list-container', {'focus': focus})}>
                            <FilterTags tags={tags} onChange={this.changeFilter}/>
                            <UndoList
                                id={DROP_TYPE.TODO}
                                storeKey={STORE_TODO_KEY}
                                className={cs('undo-list')}
                                list={todoData}
                                checked={false}
                                filterTag={filterTag}
                                placeholder={"不来一发吗?"}
                                enterActive={todoEnterAnimate}
                                transitionEnter={enableAnimate}
                                transitionLeave={false}
                                draggable={true}
                                onSelect={this.toggleOneData}
                                onDelete={this.deleteOneData}
                                onActive={this.handleActive}
                                onInsertTag={this.onInsertTag}/>
                            {
                                doneData.length > 0 &&
                                <div className="done-split"/>
                            }
                            <UndoList
                                id={DROP_TYPE.DONE}
                                storeKey={STORE_DONE_KEY}
                                className={cs('done-list')}
                                checked small
                                filterTag={filterTag}
                                list={doneData}
                                enterActive={ANIMATE.INSERT_DONE}
                                transitionEnter={false}
                                transitionLeave={false}
                                onSelect={this.toggleOneData}
                                onDelete={this.deleteOneData}
                                onInsertTag={this.onInsertTag}/>
                        </div>
                        {/* 分类 */}
                        <Category activeKey={categoryKey}
                                  options={category}
                                  onChange={this.changeCategory}/>
                        {/* 输入框 */}
                        <Input
                            id={DROP_TYPE.INPUT}
                            value={insertValue}
                            focus={!!focus}
                            max={LIMIT_WORDS}
                            onFocus={this.handleInputFocus}
                            onBlur={this.handleInputBlur}
                            onEnter={this.handleInputEnter}
                            onChange={this.handleInputChange}
                        />
                    </div>
                    {/*确认信息*/}
                    <Confirm show={confirmVisible}
                             title={confirmText}
                             onOk={this.onConfirm}
                             onCancel={this.onConfirmCancel}/>
                    {/* 工具栏 */}
                    <Tool isActive={openTool} onClose={this.handleToggleTool}>
                        <ToolTip title="导出配置">
                            <ToolBtn type='download' onClick={this.handleSave}/>
                        </ToolTip>
                        <ToolTip title="导入配置">
                            <Uploader type={ACCEPT_TYPE.JSON} onChange={this.handleRead}>
                                <ToolBtn type='upload'/>
                            </Uploader>
                        </ToolTip>
                        <ColorTheme onChange={this.handleThemeChange}/>
                    </Tool>
                </div>
            </DragDropContext>
        );
    }
}

export default App;
