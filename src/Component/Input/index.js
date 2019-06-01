import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';

import CloseBtn from '../CloseBtn';
import Tip from '../Tip';

import KEYCODE from '../../config/keycode';

import './index.scss';

export default class Input extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
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
    handleInputChange = (value) => {
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
        const {className, onFocus, onBlur} = this.props;
        const {value} = this.state;
        const empty = value.length === 0;
        return (
            <div className={cs("input-wrapper", className, {'empty': empty})}>
                <input
                    ref={comp => {this.refInput = comp}}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={this.handleInputChange}
                    onKeyPress={this.handleKeydown} />
                {
                    !empty &&  
                    <CloseBtn onClick={this.handleEmptyInput}/>
                }
            </div>
        )
    }
}