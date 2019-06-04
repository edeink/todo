import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';

import eventHelper from '../../tool/event';

export default class Tip extends PureComponent {

    static propTypes = {
        duration: PropTypes.number,
    };

    state = {
        tip: '',
        active: false,
    };

    componentWillMount() {
        window.addEventListener(eventHelper.TYPE.TIP, this._showTip);
    }

    componentWillUnmount() {
        window.addEventListener(eventHelper.TYPE.TIP, this._showTip);
    }

    static showTip = (tip, timeout) => {
        eventHelper.dispatch(eventHelper.TYPE.TIP, {tip, timeout});
    };

    // 根据输入的内容获得对应的提示
    static getTip(value, message) {
        const length = value.length;
        let findIndex = -1;
        message.some((eachMessage, index) => {
            if (eachMessage.value === value) {
                findIndex = index;
                return true;
            }
            return false;
        });
        if (length === 0) {
            return '哈哈哈，小哑巴！';
        }
        if (message.length >= 9) {
            return '装不下啦，快去干活！';
        }
        if (findIndex !== -1) {
            return '你已经说过啦！真啰嗦~';
        }
    }

    _showTip = (event) => {
        const {duration} = this.props;
        const {tip, timeout} = event.detail;
        if (this.tipsTimout) {
            clearTimeout(this.tipsTimout);
            this.tipsTimout = null;
        }
        this.setState({
            tip, active: true
        });
        this.tipsTimout = setTimeout(() => {
            this.setState({ active: false });
        }, timeout || duration || 2000);
    };

    render() {
        const {tip, active} = this.state;
        if (!tip) {
            return null;
        }
        return (
            <div className={cs("tips", { "is-active": active })}>{`${tip}`}</div>
        )
    }
}