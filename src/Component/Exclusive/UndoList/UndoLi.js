import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import {Draggable} from "react-beautiful-dnd";
import Checkbox from "../../Common/Checkbox";
import CloseBtn from "../../Common/CloseBtn";
import Time from "../../Render/Time";
import Tags from "../../Render/Tags";
import HyperLink from "../../Render/HyperLink";
import Emphasize from "../../Render/Emphasize";
import Code from "../../Render/Code";
import Delete from "../../Render/Delete";
import Text from "../../Render/Text";

import TODO_CONFIG from "../../../config";
import {TOKEN_TYPE} from "../../../tool/parser";

import './index.scss';

const {RENDER_PARSE_KEY, RENDER_ACTIVE_KEY} = TODO_CONFIG;

// 拖拽的样式
const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    background: isDragging && 'rgba(255, 255, 255, 0.2)',
    ...draggableStyle,
});

export default class UndoLi extends PureComponent {
    static propTypes = {
        index: PropTypes.number,
        listData: PropTypes.object.isRequired,
        small: PropTypes.bool,
        checked: PropTypes.bool,
        storeKey: PropTypes.string,
        className: PropTypes.string,
        draggable: PropTypes.bool,
        onSelect: PropTypes.func,
        onDelete: PropTypes.func,
        onActive: PropTypes.func,
        onInsertTag: PropTypes.func,
    };

    _renderLi = () => {
        const {listData, index, checked, onActive, onInsertTag} = this.props;
        let collect = listData[RENDER_PARSE_KEY];
        let isActive = listData[RENDER_ACTIVE_KEY];
        return (
            <div className={cs('message', {'is-active animated tada': isActive && !checked})}>
                {
                    collect.map((eachData) => {
                        let key = eachData.begin + eachData.content;
                        switch (eachData.key) {
                            case TOKEN_TYPE.TIME:
                                return <Time key={key} index={index} onActive={onActive}
                                             data={eachData} disabled={checked}/>;
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

    render() {
        const {
            index, listData, small,  checked, storeKey, className,
            onSelect, onDelete, draggable
        } = this.props;
        const isActive = listData[RENDER_ACTIVE_KEY] === true ? 1 : 0;
        if (draggable) {
            return (
                <Draggable
                    key={listData.value + isActive}
                    index={index}
                    isDragDisabled={!draggable}
                    draggableId={listData.value + index}>
                    {(provided, snapshot) => (
                        <li ref={provided.innerRef}
                            className={cs("li", className, {"checked": checked})}
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
                                    onDelete(index, storeKey, event)
                                }}/>
                            }

                        </li>
                    )}
                </Draggable>
            )
        } else {
            return (
                <li className={cs("li undo-li", className, {"checked": checked})}>
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

    }
}