import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';

import eventHelper from '../../../tool/event';
import TODO_CONFIG from '../../../config';

import './index.scss';

export default class Tip extends PureComponent {

    static propTypes = {
        duration: PropTypes.number,
    };

    state = {
        tip: '',
        active: false,
    };

    componentDidMount() {
        window.addEventListener(eventHelper.TYPE.TIP, this._showTip);
    }

    componentWillUnmount() {
        window.removeEventListener(eventHelper.TYPE.TIP, this._showTip);
    }

    static showTip = (tip, timeout) => {
        eventHelper.dispatch(eventHelper.TYPE.TIP, {tip, timeout});
    };

    // 根据输入的内容获得对应的提示
    static getTip(value, message, isAnti) {
        const length = value.length;
        let findIndex = -1;
        let stringKey = TODO_CONFIG.RENDER_STRING_KEY;
        message.some((eachMessage, index) => {
            if (eachMessage[stringKey] === value) {
                findIndex = index;
                return true;
            }
            return false;
        });
        if (isAnti !== true) {
            if (length === 0) {
                return {tip: '哈哈哈，小哑巴！'};
            }
        }
        if (findIndex !== -1) {
            return {
                index: findIndex,
                tip: '你已经说过啦！真啰嗦~'
            }
        }
        return {
            tip: ''
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
            this.setState({active: false});
        }, timeout || duration || 2000);
    };

    render() {
        const {tip, active} = this.state;
        if (!tip) {
            return null;
        }
        return (
            <div className={cs("tips", {"is-active": active})}>{`${tip}`}</div>
        )
    }
}