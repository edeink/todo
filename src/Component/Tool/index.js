import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';
import CloseBtn from "../CloseBtn";

class ToolBtn extends PureComponent {
    static propTypes = {
        type: PropTypes.string,
        onClick: PropTypes.func,
        onClose: PropTypes.func,
    };

    render() {
        const {type, onClick} = this.props;
        return (
            <div className="tool-btn" onClick={onClick}>
                <i className={`iconfont icon-${type}`}/>
            </div>
        )
    }
}

export {ToolBtn};

export default class Tool extends PureComponent {

    static Btn = ToolBtn;

    static propTypes = {
        children: PropTypes.array,
    };

    render() {
        const {children, onClose} = this.props;
        return (
            <div className="tool">
                { children }
                <CloseBtn onClick={onClose}/>
            </div>
        )
    }
}