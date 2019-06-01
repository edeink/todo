import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import cs from 'classnames';

import Checkbox from '../Checkbox';
import CloseBtn from '../CloseBtn';

import './index.scss';

// 拖拽的样式
const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    background: isDragging && 'rgba(255, 255, 255, 0.2)',
    ...draggableStyle
});
const getListStyle = isDraggingOver => ({});

export default class Undo extends PureComponent {
    static propTypes = {
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
        const { list, onDrag } = this.props;
        const { source, destination } = result;
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

    _renderUndoLi(index, eachList) {
        const { small, checked, onSelect, onDelete, onDrag } = this.props;
        return (
            <Draggable
                key={index}
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
                            onChange={(value) => { onSelect(index, value) }} />
                        <span className="message">{eachList.value}</span>
                        <CloseBtn onClick={(event) => { onDelete(index, event) }} />
                    </li>
                )}
            </Draggable>
        )
    }

    render() {
        const { placeholder, className, list } = this.props;

        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="todo-drop">
                    {
                        (provided, snapshot) => (
                            <ul
                                ref={provided.innerRef}
                                style={getListStyle(snapshot.isDraggingOver)}
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