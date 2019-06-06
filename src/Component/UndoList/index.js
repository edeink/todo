import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import {CSSTransitionGroup} from 'react-transition-group'
import cs from 'classnames';

import Checkbox from '../Checkbox';
import CloseBtn from '../CloseBtn';
import Time from '../Render/Time';
import Tags from '../Render/Tags';
import Text from '../Render/Text';
import HyperLink from '../Render/HyperLink';
import Emphasize from '../Render/Emphasize';
import Code from '../Render/Code';
import Delete from '../Render/Delete';

import {TOKEN_TYPE} from '../../tool/parser';
import {stringify} from "../../tool/json";

import './index.scss';

// 拖拽的样式
const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    background: isDragging && 'rgba(255, 255, 255, 0.2)',
    ...draggableStyle
});
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
        if (stringify(list) !== stringify(nextProps.list)) {
            return true;
        }
        return false;
    }

    _renderLi(eachList, isDragging) {
        // const {checked} = this.props;
        let collect = eachList.__parseData;
        return (
            <div className='message'>
                {
                    collect.map((eachData) => {
                        let key = eachData.begin + eachData.content;
                        switch (eachData.key) {
                            case TOKEN_TYPE.TIME:
                                return <Time key={key} data={eachData}/>
                            case TOKEN_TYPE.Tag:
                                return <Tags key={key} data={eachData}/>
                            case TOKEN_TYPE.HYPERLINK:
                                return <HyperLink key={key} data={eachData}/>
                            case TOKEN_TYPE.ITALIC:
                            case TOKEN_TYPE.EM:
                            case TOKEN_TYPE.EM_ITALIC:
                                return <Emphasize key={key} data={eachData}/>
                            case TOKEN_TYPE.CODE:
                                return <Code key={key} data={eachData}/>
                            case TOKEN_TYPE.DELETE:
                                return <Delete key={key} data={eachData}/>
                            case TOKEN_TYPE.TEXT:
                            default:
                                return <Text key={key} data={eachData}/>
                        }
                    })
                }
            </div>
        )
    }

    _renderUndoLi(index, eachList) {
        const {small, checked, storeKey, onSelect, onDelete, onDrag} = this.props;
        return (
            <Draggable
                key={eachList.value}
                index={index}
                isDragDisabled={!onDrag}
                draggableId={eachList.value + index}>
                {(provided, snapshot) => (

                    <li ref={provided.innerRef}
                        className={cs("li", {"checked": checked})}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                        )}>

                        <Checkbox
                            small={small}
                            checked={checked}
                            onChange={(value) => {
                                onSelect(index, value, storeKey)
                            }}/>
                        {
                            this._renderLi(eachList, snapshot.isDragging,)
                        }

                        <CloseBtn onClick={(event) => {
                            onDelete(index, storeKey, event)
                        }}/>
                    </li>
                )}
            </Draggable>
        )
    }

    render() {
        let {id, placeholder, className, list,
            enterActive, leaveActive, transitionEnter, transitionLeave} = this.props;

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
                                            return this._renderUndoLi(index, eachList, provided.placeholder)

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