// import './index.scss';

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import FilterTags from "../FilterTags";
import Category, {DeleteEmptyCategory} from "../Category";
import UndoList from "../UndoList";
import {DROP_TYPE} from "../../../tool/drag";
import Input from "../Input";
import TODO_CONFIG from "../../../config";
import Tip from "../Tip";
import {copy, stringify} from "../../../data/store/json";
import parser from "../../../data/_deprecated/parser";
import eventHelper from "../../../tool/event";
import DataManager from "../../../data/_deprecated/dataManager";

const store = window.localStorage;

// 从配置中读取信息
const {
    DEFAULT_CATEGORY_KEY, STORE_TODO_KEY,
    STORE_DONE_KEY,
    RENDER_ACTIVE_KEY, RENDER_PARSE_KEY, RENDER_STRING_KEY,
    RENDER_TAGS_KEY, RENDER_TIME_KEY, LIMIT_WORDS
} = TODO_CONFIG;

const getAntiStoreKey = function (storeKey) {
    return storeKey === STORE_TODO_KEY ? STORE_DONE_KEY : STORE_TODO_KEY;
};

const getRealStoreKey = function (category, key) {
    return `__${category}_${key}`;
};

export default class Todo extends PureComponent {
    static propTypes = {
        openTool: PropTypes.bool.isRequired,
    };

    state = {
        [STORE_TODO_KEY]: [],
        [STORE_DONE_KEY]: [],
        insertValue: '', // input中输入的值
        filterTag: [],  // 需要过滤的tag
        tags: [],
        category: [], // 所有分类
        activeCategoryKey: '', // 激活的分类
    };

    componentDidMount() {
        window.addEventListener(eventHelper.TYPE.READ_DATA, this.handleRead);
        window.addEventListener(eventHelper.TYPE.SAVE_DATA, DataManager.saveData2Config);
        window.addEventListener(eventHelper.TYPE.DRAG_END, this.onDragEnd);

        this.readData();
    }

    componentWillUnmount() {
        window.removeEventListener(eventHelper.TYPE.READ_DATA, this.handleRead);
        window.removeEventListener(eventHelper.TYPE.SAVE_DATA, DataManager.saveData2Config);
        window.removeEventListener(eventHelper.TYPE.DRAG_END, this.onDragEnd);
    }

    // 从持久化中读取数据
    readData = () => {
        const {category, activeCategoryKey} = DataManager.readCategory();
        const {tags, data} = DataManager.readData(activeCategoryKey);
        this.setState({
            ...data,
            tags,
            category,
            activeCategoryKey,
        });
    };

    handleRead = (event) => {
        const {category, data} = event.detail.data;
        DataManager.saveConfig2Data(category, data);
        // 再从缓存中读取
        this.readData();
        Tip.showTip('读取成功')
    };

    insertOneData = (data, storeKey, isEnter) => {
        if (!data || data.value === '') {
            Tip.showTip('输入不可为空');
            return false;
        }

        const {activeCategoryKey, tags} = this.state;
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
        const realStoreKey = getRealStoreKey(activeCategoryKey, storeKey);
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
            this.deleteOneData(index, storeKey);
        }
    };

    // 拖拽数据
    dragData = (listData, storeKey) => {
        const {activeCategoryKey} = this.state;
        this.setState({
            [storeKey]: [...listData]
        });
        const realStoreKey = getRealStoreKey(activeCategoryKey, storeKey);
        store.setItem(realStoreKey, stringify(listData));
    };

    // 更改一条数据
    changeOneData = (index, data, storeKey) => {
        const {activeCategoryKey} = this.state;
        const todoData = this.state[STORE_TODO_KEY];
        let listData = [...todoData];
        listData[index] = data;
        this.setState({
            [storeKey]: listData
        });
        const realStoreKey = getRealStoreKey(activeCategoryKey, storeKey);
        store.setItem(realStoreKey, stringify(listData));
    };

    // 询问是否删除后
    queryDelete = (index, storeKey) => {
        eventHelper.dispatch(eventHelper.TYPE.CONFIRM, {
            text: '是否确认删除',
            ensure: () => {
                this.deleteOneData(index, storeKey);
            }
        });
    };

    // 删除列表
    deleteOneData = (index, storeKey) => {
        const {activeCategoryKey} = this.state;
        const preData = this.state[storeKey];
        const newData = [...preData];
        const deleteData = newData.splice(index, 1);
        const realStoreKey = getRealStoreKey(activeCategoryKey, storeKey);
        store.setItem(realStoreKey, stringify(newData));
        this.setState({
            [storeKey]: newData
        }, () => {
            this.checkTagExist(deleteData[0]);
        });
    };

    // 更新tags后需要确认之前的Tag是否存在
    checkTagExist(deleteData) {
        let deleteDataTag = deleteData[RENDER_TAGS_KEY];
        // 没有Tag，不需要确认
        if (!deleteDataTag.length) {
            return;
        }
        const todoData = this.state[STORE_TODO_KEY];
        const doneData = this.state[STORE_DONE_KEY];
        const {tags: allTag} = this.state;
        let newTags = new Set(allTag);
        let tags = [...deleteDataTag];
        let deleteTag = [];
        let isNotChange = tags.every(function (eachTag) {
            let find = todoData.some(function (eachTodoData) {
                return eachTodoData[RENDER_TAGS_KEY].has(eachTag);
            });
            // 提前结束
            if (find) {
                return find;
            } else {
                find = doneData.some(function (eachDoneData) {
                    return eachDoneData[RENDER_TAGS_KEY].has(eachTag);
                });
                if (!find) {
                    deleteTag.push(eachTag);
                }
                return find;
            }
        });
        if (isNotChange === false) {
            deleteTag.forEach(function (eachDelTag) {
                newTags.delete(eachDelTag);
            });
            this.setState({
                tags: Array.from(newTags)
            });
        }
    }

    onDragEnd = (event) => {
        const {source, destination} = event.detail.result;
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
                    this.deleteOneData(sourceIndex, STORE_TODO_KEY);
                });
                break;
            }
            default:
                break;
        }
    };

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
                let newTempData = copy(tempData);
                newTempData[RENDER_ACTIVE_KEY] = false;
                newData[index] = newTempData;
                this.setState({
                    [storeKey]: [...newData]
                })
            }, 1000);
        }
    };

    changeFilter = (filterTag) => {
        this.setState({
            filterTag
        })
    };

    // 插入新的Tag
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

    handleInputChange = (value) => {
        this.setState({
            insertValue: value
        })
    };

    handleInputEnter = (value) => {
        return this.insertOneData({
            value
        }, STORE_TODO_KEY, true);
    };

    // 更改页签内容
    changeCategory = (category) => {
        this.setState({
            category: category
        });
    };

    render() {
        const {filterTag, insertValue, activeCategoryKey, category,
            tags} = this.state;
        const {openTool} = this.props;
        const todoData = this.state[STORE_TODO_KEY];
        const doneData = this.state[STORE_DONE_KEY];
        const isEmpty = activeCategoryKey && todoData.length === 0 && doneData.length === 0;
        return (
            <div className={cs('app-wrapper', {'open-tool': openTool})}>
                {/* 列表 */}
                <div className={cs('list-container')}>
                    <FilterTags tags={tags} onChange={this.changeFilter}/>
                    {
                        isEmpty && activeCategoryKey !== DEFAULT_CATEGORY_KEY ?
                            <DeleteEmptyCategory/> :
                            <React.Fragment>
                                <UndoList
                                    id={DROP_TYPE.TODO}
                                    storeKey={STORE_TODO_KEY}
                                    className={cs('undo-list')}
                                    list={todoData}
                                    checked={false}
                                    filterTag={filterTag}
                                    placeholder={"不来一发吗?"}
                                    transitionEnter={true}
                                    draggable={true}
                                    onSelect={this.toggleOneData}
                                    onDelete={this.queryDelete}
                                    onActive={this.handleActive}
                                    onInsertTag={this.onInsertTag}
                                    onChangeData={this.changeOneData}/>
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
                                    transitionEnter={false}
                                    onSelect={this.toggleOneData}
                                    onDelete={this.queryDelete}
                                    onInsertTag={this.onInsertTag}/>
                            </React.Fragment>
                    }
                </div>
                {/* 分类 */}
                <Category
                    activeKey={activeCategoryKey}
                    options={category}
                    onChange={this.changeCategory}
                    onActive={this.readData}
                    onDelete={this.readData}/>
                {/* 输入框 */}
                <Input
                    id={DROP_TYPE.INPUT}
                    value={insertValue}
                    max={LIMIT_WORDS}
                    onEnter={this.handleInputEnter}
                    onChange={this.handleInputChange}
                />
            </div>
        )
    }
}