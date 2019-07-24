import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Droppable} from "react-beautiful-dnd";
import {CSSTransitionGroup} from 'react-transition-group'
import cs from 'classnames';

import UndoLi from './UndoLi';

import {stringify} from "../../../tool/json";
import TODO_CONFIG from '../../../config';

import './index.scss';

const {RENDER_TAGS_KEY} = TODO_CONFIG;

export default class UndoList extends Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        storeKey: PropTypes.string.isRequired,
        list: PropTypes.array,
        checked: PropTypes.bool,
        filterTag: PropTypes.array,
        small: PropTypes.bool,
        placeholder: PropTypes.string,
        enterActive: PropTypes.string,
        leaveActive: PropTypes.string,
        transitionEnter: PropTypes.bool,
        transitionLeave: PropTypes.bool,
        draggable: PropTypes.bool,
        onSelect: PropTypes.func,
        onDelete: PropTypes.func,
        onInsertTag: PropTypes.func,

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

    _renderUndoLi(eachList, index, filterTag) {
        const {small, checked, storeKey, draggable, onSelect, onDelete, onInsertTag} = this.props;
        const tags = eachList[RENDER_TAGS_KEY];
        let isMatch = true;
        if (filterTag.length > 0) {
            isMatch = filterTag.some(function(eachFilterTag) {
                return tags.indexOf(eachFilterTag) !== -1;
            });
        }
        return (
            <UndoLi
                listData={eachList}
                key={eachList.value}
                index={index}
                small={small}
                checked={checked}
                isMatch={isMatch}
                storeKey={storeKey}
                draggable={draggable}
                onSelect={onSelect}
                onDelete={onDelete}
                onActive={this.onActive}
                onInsertTag={onInsertTag}/>
        )
    }

    render() {
        let {
            id, placeholder, className, list,
            enterActive, leaveActive, transitionEnter, transitionLeave,
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
                                        return this._renderUndoLi(eachList, index, filterTag);
                                    })
                                }
                            </CSSTransitionGroup>
                            {provided.placeholder}
                        </ul>
                    )
                }
            </Droppable>
        )
    }
}