import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
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

import parser, {TOKEN_TYPE} from '../../tool/parser';

import './index.scss';

// 拖拽的样式
const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    background: isDragging && 'rgba(255, 255, 255, 0.2)',
    ...draggableStyle
});
const getListStyle = (isDraggingOver, refUl) => {
    if (isDraggingOver === true) {
        let children = refUl.children;
        if (children && children.length > 0) {
            let listHeight = 0;
            for(let i=0; i<children.length; i++) {
                listHeight += children[i].clientHeight;
            }
            return {
                height: listHeight
            }
        }
    }
};

export default class Undo extends Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        list: PropTypes.array,
        checked: PropTypes.bool,
        small: PropTypes.bool,
        placeholder: PropTypes.string,
        onSelect: PropTypes.func,
        onDelete: PropTypes.func,
        onDrag: PropTypes.func,
    };

    onDragEnd = (result) => {
        const {list, onDrag} = this.props;
        const {source, destination} = result;
        if (!onDrag || !destination) {
            return;
        }
        const sourceIndex = source.index;
        const destinationIndex = destination.index;
        const sourceMsg = list[sourceIndex];
        // 根据拖拽结果调整数据顺序
        if (sourceIndex < destinationIndex) {
            for (let i = sourceIndex; i < destinationIndex; i++) {
                list[i] = list[i + 1];
            }
        } else if (sourceIndex > destinationIndex) {
            for (let i = sourceIndex; i > destinationIndex; i--) {
                list[i] = list[i - 1];
            }
        }
        list[destinationIndex] = sourceMsg;
        onDrag(list);
    };
    
    _renderLi(eachList) {
        const {checked} = this.props;
        let collect = parser.parse(eachList.value);
        console.log(eachList.value, collect);
        return (
            <div className={cs('message', {'checked': checked})}>
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
        const {small, checked, onSelect, onDelete, onDrag} = this.props;
        return (
            <Draggable
                key={eachList.value + index}
                index={index}
                isDragDisabled={!onDrag}
                draggableId={eachList.value + index}>
                {(provided, snapshot) => (
                    <li ref={provided.innerRef}
                        className="li"
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
                                onSelect(index, value)
                            }}/>
                        {
                            this._renderLi(eachList)
                        }

                        <CloseBtn onClick={(event) => {
                            onDelete(index, event)
                        }}/>
                    </li>
                )}
            </Draggable>
        )
    }

    render() {
        const {id, placeholder, className, list} = this.props;

        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId={id}>
                    {
                        (provided, snapshot) => (
                            <ul
                                ref={(comp) => {this.refUl = comp; provided.innerRef(comp)}}
                                style={getListStyle(snapshot.isDraggingOver, this.refUl)}
                                className={cs('list', className)}>
                                {
                                    (!list || list.length === 0) && placeholder &&
                                    <div className="list-holder">{placeholder}</div>
                                }
                                {
                                    list.map((eachList, index) => {
                                        return this._renderUndoLi(index, eachList);
                                    })
                                }
                            </ul>
                        )
                    }
                </Droppable>
            </DragDropContext>
        )
    }
}