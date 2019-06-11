import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';

import CloseBtn from '../CloseBtn/index';
import Tip from '../../Exclusive/Tip/index';
import UndoLi from "../../Exclusive/UndoList/UndoLi";

import parser from "../../../tool/parser";
import TODO_CONFIG from "../../../config";
import KEYCODE from '../../../tool/keycode';

import './index.scss';

const {RENDER_PARSE_KEY} = TODO_CONFIG;

export default class Input extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        focus: PropTypes.bool,
        max: PropTypes.number,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onChange: PropTypes.func,
        onEnter: PropTypes.func,
    };

    state = {
        value: '',
    };

    handleKeydown = (event) => {
        const {onEnter} = this.props;
        if (onEnter && event.nativeEvent.keyCode === KEYCODE.ENTER) {
            const value = this.refInput.value;
            this.setState({value});
            if(onEnter(value)) {
                this.handleEmptyInput();
            }
        }
    };

    handleEmptyInput = () => {
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
        this.setState({ value });
        onChange && onChange(value);
    };

    render() {
        const {className, focus, onFocus, onBlur} = this.props;
        const {value} = this.state;
        const empty = value.length === 0;
        const parseData = parser.parse(value, true);
        const renderData = {
            [RENDER_PARSE_KEY]: parseData
        };

        // focus && !empty && parseData &&

        return (
            <React.Fragment>
                {
                    parseData &&
                    <UndoLi className="input-li" listData={renderData}/>
                }
                <div className={cs("input-wrapper", className, {'empty': empty, 'focus': focus})}>
                    <input
                        ref={comp => {this.refInput = comp}}
                        placeholder={' Enter 确认'}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        onChange={this.handleInputChange}
                        onKeyPress={this.handleKeydown} />
                    {
                        !empty &&
                        <CloseBtn onClick={this.handleEmptyInput}/>
                    }
                </div>
            </React.Fragment>
        )
    }
}