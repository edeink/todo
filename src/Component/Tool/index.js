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
        onMouseEnter: PropTypes.func,
        onMouseLeave: PropTypes.func,
    };

    render() {
        const {type, onClick, onMouseEnter, onMouseLeave} = this.props;
        return (
            <div className="tool-btn"
                 onMouseEnter={onMouseEnter}
                 onMouseLeave={onMouseLeave}
                 onClick={onClick}>
                <i className={`iconfont icon-${type}`}/>
            </div>
        )
    }
}

export {ToolBtn};

export default class Tool extends PureComponent {

    static Btn = ToolBtn;

    static propTypes = {
        isActive: PropTypes.bool.isRequired,
        children: PropTypes.array,
    };

    render() {
        const {isActive, children, onClose} = this.props;
        return (
            <div className={cs('tool', {'is-active': isActive})}>
                { isActive && children }
                <CloseBtn onClick={onClose}/>
            </div>
        )
    }
}