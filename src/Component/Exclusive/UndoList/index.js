import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';
import {CSSTransitionGroup} from 'react-transition-group'
import cs from 'classnames';

import UndoLi from './UndoLi';

import {stringify} from "../../../tool/json";

import './index.scss';

const getListStyle = (isDraggingOver, refUl) => {
};

export default class UndoList extends Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        storeKey: PropTypes.string.isRequired,
        list: PropTypes.array,
        checked: PropTypes.bool,
        small: PropTypes.bool,
        placeholder: PropTypes.string,
        enterActive: PropTypes.string,
        leaveActive: PropTypes.string,
        transitionEnter: PropTypes.bool,
        transitionLeave: PropTypes.bool,
        onSelect: PropTypes.func,
        onDelete: PropTypes.func,
        onDrag: PropTypes.func,
    };

    onDragEnd = (result) => {
        const {list, storeKey, onDrag} = this.props;
        const newList = [...list];
        const {source, destination} = result;
        if (!onDrag || !destination) {
            return;
        }
        const sourceIndex = source.index;
        const destinationIndex = destination.index;
        const sourceMsg = newList[sourceIndex];
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
        onDrag(newList, storeKey);
    };

    shouldComponentUpdate(nextProps) {
        const {list} = this.props;
        if (list.length !== nextProps.list.length) {
            return true;
        }
        let preList = stringify(list);
        let newList = stringify(nextProps.list);
        if (preList !== newList) {
            return true;
        }
        return false;
    }

    onActive = (index) => {
        const {storeKey, onActive} = this.props;
        onActive(index, storeKey);
    };

    _renderUndoLi(eachList, index,) {
        const {small, checked, storeKey, onSelect, onDelete, onDrag} = this.props;
        return (
            <UndoLi
                listData={eachList}
                key={eachList.value}
                index={index}
                small={small}
                checked={checked}
                storeKey={storeKey}
                onSelect={onSelect}
                onDelete={onDelete}
                onDrag={onDrag}
                onActive={this.onActive}/>
        )
    }

    render() {
        let {
            id, placeholder, className, list,
            enterActive, leaveActive, transitionEnter, transitionLeave,
        } = this.props;

        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId={id}>
                    {
                        (provided, snapshot) => (
                            <ul
                                ref={provided.innerRef}
                                style={getListStyle(snapshot.isDraggingOver)}
                                className={cs('list', className)}>
                                {
                                    (!list || list.length === 0) && placeholder &&
                                    <div key="place-older"
                                         className="list-holder">{placeholder}</div>
                                }
                                <CSSTransitionGroup
                                    transitionName={{
                                        enter: "animated",
                                        enterActive: enterActive || "bounceIn",
                                        leave: "animated",
                                        leaveActive: leaveActive || "fadeOutRight"
                                    }}
                                    transitionEnter={transitionEnter && true}
                                    transitionLeave={transitionLeave && true}
                                    transitionEnterTimeout={300}
                                    transitionLeaveTimeout={200}>
                                    {
                                        list.map((eachList, index) => {
                                            return this._renderUndoLi(eachList, index);
                                        })
                                    }
                                </CSSTransitionGroup>
                                {provided.placeholder}
                            </ul>
                        )
                    }
                </Droppable>
            </DragDropContext>
        )
    }
}