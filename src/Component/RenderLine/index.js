import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import {Draggable} from "react-beautiful-dnd";
import Checkbox from "../Common/Checkbox";
import CloseBtn from "../Common/CloseBtn";
import Time from "./Time";
import Tags from "./Tags";
import HyperLink from "./HyperLink";
import Emphasize from "./_deprecated/Emphasize";
import Code from "./_deprecated/Code";
import Delete from "./_deprecated/Delete";
import Text from "./Text";

import TODO_CONFIG from "../../config";
import {TOKEN_TYPE} from "../../data/_deprecated/parser";

import './index.scss';

const {RENDER_PARSE_KEY, RENDER_ACTIVE_KEY, RENDER_TIME_KEY} = TODO_CONFIG;

// 拖拽的样式
const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    background: isDragging && 'rgba(255, 255, 255, 0.2)',
    ...draggableStyle,
});

export default class RenderLine extends PureComponent {
    static propTypes = {
        index: PropTypes.number,
        listData: PropTypes.object.isRequired,
        small: PropTypes.bool,
        checked: PropTypes.bool,
        storeKey: PropTypes.string,
        className: PropTypes.string,
        isMatch: PropTypes.bool,
        draggable: PropTypes.bool,
        // 动作回调
        onSelect: PropTypes.func,
        onDelete: PropTypes.func,
        onActive: PropTypes.func,
        onInsertTag: PropTypes.func,
        onChangeData: PropTypes.func,
    };

    // 更改定时器的时间
    handleTimeChange = (time, fragIndex) => {
        const {listData, index, onChangeData} = this.props;
        const newData = Object.assign({}, listData);
        newData[RENDER_TIME_KEY] = time;
        newData[RENDER_ACTIVE_KEY] = false;
        onChangeData(index, newData);
    }

    _renderLi = () => {
        const {listData, index, checked, onActive, onInsertTag} = this.props;
        let collect = listData[RENDER_PARSE_KEY];
        let isActive = listData[RENDER_ACTIVE_KEY];
        let time = listData[RENDER_TIME_KEY];
        return (
            <div className={cs('message', {'is-active animated tada': isActive && !checked})}>
                {
                    collect.map((eachData, fragIndex) => {
                        let key = eachData.begin + eachData.content;
                        switch (eachData.key) {
                            case TOKEN_TYPE.TIME:
                                return <Time key={key} index={index} isActive={isActive}
                                             data={eachData} disabled={checked} time={time}
                                             onActive={onActive}
                                             onChange={(time) => {
                                                 this.handleTimeChange(time, fragIndex)
                                             }}/>;
                            case TOKEN_TYPE.TAG:
                                return <Tags key={key} data={eachData} onDblClick={onInsertTag}/>;
                            case TOKEN_TYPE.HYPERLINK:
                                return <HyperLink key={key} data={eachData}/>;
                            case TOKEN_TYPE.ITALIC:
                            case TOKEN_TYPE.EM:
                            case TOKEN_TYPE.EM_ITALIC:
                                return <Emphasize key={key} data={eachData}/>;
                            case TOKEN_TYPE.CODE:
                                return <Code key={key} data={eachData}/>;
                            case TOKEN_TYPE.DELETE:
                                return <Delete key={key} data={eachData}/>;
                            case TOKEN_TYPE.TEXT:
                            default:
                                return <Text key={key} data={eachData}/>;
                        }
                    })
                }
            </div>
        )
    };

    // 可拖拽列表
    renderDraggableLi() {
        const {
            index, listData, small, checked, storeKey, className,
            onSelect, onDelete, draggable, isMatch
        } = this.props;
        const isActive = listData[RENDER_ACTIVE_KEY] === true ? 1 : 0;
        return (
            <Draggable
                key={listData.value + isActive}
                index={index}
                isDragDisabled={!draggable}
                draggableId={listData.value + index}>
                {(provided, snapshot) => (
                    <li ref={provided.innerRef}
                        className={cs("li", className, {"checked": checked, "hidden": isMatch === false})}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style,
                        )}>
                        {
                            onSelect &&
                            <Checkbox
                                small={small}
                                checked={checked}
                                onChange={(value) => {
                                    onSelect(index, value, storeKey)
                                }}/>
                        }
                        {this._renderLi()}
                        {
                            onDelete &&
                            <CloseBtn onClick={(event) => {
                                onDelete(index, storeKey, event, true)
                            }}/>
                        }

                    </li>
                )}
            </Draggable>
        )
    }

    // 不可拖拽列表
    renderSimpleLi() {
        const {
            index, small, checked, storeKey, className,
            onSelect, onDelete, isMatch
        } = this.props;
        return (
            <li className={cs("li", className, {"checked": checked, "hidden": isMatch === false})}>
                {
                    onSelect &&
                    <Checkbox
                        small={small}
                        checked={checked}
                        onChange={(value) => {
                            onSelect(index, value, storeKey)
                        }}/>
                }
                {this._renderLi()}
                {
                    onDelete &&
                    <CloseBtn onClick={(event) => {
                        onDelete(index, storeKey, event)
                    }}/>
                }

            </li>
        )
    }

    render() {
        const {draggable} = this.props;
        return draggable ? this.renderDraggableLi() : this.renderSimpleLi();
    }
}