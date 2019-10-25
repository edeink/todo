import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Droppable} from "react-beautiful-dnd";
import cs from 'classnames';

import CloseBtn from '../../Common/CloseBtn/index';
import Tip from '../Tip/index';
import RenderLine from "../../RenderLine";

import parser from "../../../tool/parser";
import TODO_CONFIG from "../../../config/index";
import KEYCODE from '../../../tool/keycode';

import './index.scss';

const {RENDER_PARSE_KEY} = TODO_CONFIG;

function getDragOverStyle(isDragOver) {
    if (isDragOver) {
        return {
            color: 'transparent',
            background: 'rgba(0, 0, 0, .5)',
            border: '1px solid rgba(255, 255, 255, .8)',
        }
    }
}

export default class Input extends PureComponent {
    static propTypes = {
        id: PropTypes.string,
        value: PropTypes.string,
        className: PropTypes.string,
        focus: PropTypes.bool,
        max: PropTypes.number,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onChange: PropTypes.func,
        onEnter: PropTypes.func,
    };

    static getDerivedStateFromProps(props) {
        return {
            value: props.value
        }

    }

    state = {
        value: '',
    };

    handleKeydown = (event) => {
        const {onEnter} = this.props;
        if (onEnter && event.nativeEvent.keyCode === KEYCODE.ENTER) {
            const value = this.refInput.value;
            this.setState({value});
            if (onEnter(value)) {
                this.handleEmptyInput();
            }
        }
    };

    handleEmptyInput = () => {
        this.props.onChange('');
        this.setState({value: ''});
        this.refInput.value = '';
        this.refInput.focus();
    };

    // 输入框内容发生改变
    handleInputChange = (event) => {
        let value = event.target.value;
        const {max, onChange} = this.props;
        if (max && value && value.length > max) {
            Tip.showTip('无法加载更多');
            value = value.substr(0, max);
            this.refInput.value = value;
        }
        this.setState({value});
        onChange && onChange(value);
    };

    render() {
        const {id, className, focus, onFocus, onBlur} = this.props;
        const {value} = this.state;
        const empty = value.length === 0;
        const parseData = parser.parse(value, true);
        const renderData = {
            [RENDER_PARSE_KEY]: parseData
        };

        // focus && !empty && parseData &&

        return (
            <Droppable droppableId={id}>
                {
                    (provided, snapshot) => (
                        <React.Fragment>
                            {
                                (parseData && parseData.length >= 2) &&
                                <RenderLine className={cs("input-li", {'focus': focus})} listData={renderData}/>
                            }
                            <div ref={provided.innerRef}
                                 className={cs("input-wrapper", className,
                                     {'empty': empty, 'focus': focus})}>
                                {provided.placeholder}
                                <input
                                    ref={comp => {
                                        this.refInput = comp
                                    }}
                                    style={getDragOverStyle(snapshot.isDraggingOver)}
                                    placeholder={' Enter 确认'}
                                    onFocus={onFocus}
                                    onBlur={onBlur}
                                    onChange={this.handleInputChange}
                                    onKeyPress={this.handleKeydown}/>
                                {
                                    !empty &&
                                    <CloseBtn onClick={this.handleEmptyInput}/>
                                }
                            </div>
                        </React.Fragment>
                    )
                }
            </Droppable>

        )
    }
}