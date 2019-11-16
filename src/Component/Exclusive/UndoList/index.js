import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';

import {Droppable} from "react-beautiful-dnd";
import {TransitionGroup, CSSTransition} from 'react-transition-group'
import RenderLine from '../../RenderLine';

import {stringify} from "../../../data/store/json";
import TODO_CONFIG from '../../../config';

import './index.scss';

const {RENDER_TAGS_KEY} = TODO_CONFIG;

export default class UndoList extends Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        // 本地持久化需要的key
        storeKey: PropTypes.string.isRequired,
        // 列表原始数据
        list: PropTypes.array,
        // 是否勾选
        checked: PropTypes.bool,
        // 过滤分类
        filterTag: PropTypes.array,
        // 尺寸变小
        small: PropTypes.bool,
        placeholder: PropTypes.string,
        // 增加是否启用动画效果
        transitionEnter: PropTypes.bool,
        // 是否允许拖拽
        draggable: PropTypes.bool,
        // 动作回调
        onSelect: PropTypes.func,
        onDelete: PropTypes.func,
        onInsertTag: PropTypes.func,
        onChangeData: PropTypes.func,
    };

    shouldComponentUpdate(nextProps) {
        const {list, filterTag} = this.props;
        if (list.length !== nextProps.list.length) {
            return true;
        }

        let preList = stringify(list);
        let newList = stringify(nextProps.list);
        if (preList !== newList) {
            return true;
        }

        if (filterTag !== nextProps.filterTag) {
            return true;
        }
        return false;
    }

    onActive = (index) => {
        const {storeKey, onActive} = this.props;
        onActive(index, storeKey);
    };

    handleChangeData = (index, data) => {
        const {onChangeData, storeKey} = this.props;
        onChangeData(index, data, storeKey);
    }

    _renderUndoLi(eachList, index, filterTag) {
        const {
            small, checked, storeKey, draggable, onSelect, onDelete, onInsertTag, transitionEnter,
        } = this.props;
        const tags = eachList[RENDER_TAGS_KEY];
        let isMatch = true;
        if (filterTag.length > 0) {
            isMatch = filterTag.some(function (eachFilterTag) {
                return tags.has(eachFilterTag);
            });
        }
        return (
            <CSSTransition
                className="animated"
                classNames={{
                    enter: transitionEnter ? "bounceIn" : '',
                }}
                key={eachList.value}
                timeout={{
                    enter: transitionEnter ? 300 : 0,
                    exit: 0
                }}>
                <RenderLine
                    listData={eachList}
                    index={index}
                    small={small}
                    checked={checked}
                    isMatch={isMatch}
                    storeKey={storeKey}
                    draggable={draggable}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    onActive={this.onActive}
                    onInsertTag={onInsertTag}
                    onChangeData={this.handleChangeData}/>
            </CSSTransition>
        )
    }

    render() {
        let {
            id, placeholder, className, list,
            filterTag,
        } = this.props;

        return (
            <Droppable droppableId={id}>
                {
                    (provided, snapshot) => (
                        <ul
                            ref={provided.innerRef}
                            className={cs('list', className)}>
                            {
                                (!list || list.length === 0) && placeholder &&
                                <div key="place-older"
                                     className="list-holder">{placeholder}</div>
                            }
                            <TransitionGroup>
                                {
                                    list.map((eachList, index) => {
                                        return this._renderUndoLi(eachList, index, filterTag);
                                    })
                                }
                            </TransitionGroup>

                            {provided.placeholder}
                        </ul>
                    )
                }
            </Droppable>
        )
    }
}