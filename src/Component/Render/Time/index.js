import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import cs from 'classnames';

import ToolTip from '../../Common/ToolTip';

import TODO_CONFIG from '../../../config'
import {notify} from "../../../tool/adaptor";

import './index.scss';

export default class Time extends Component {
    static propTypes = {
        index: PropTypes.number,
        data: PropTypes.object.isRequired,
        disabled: PropTypes.bool,
        onActive: PropTypes.func,
    };

    componentDidMount() {
        const {data, disabled, onActive} = this.props;
        if (data && onActive && !disabled) {
            const {data: timeData} = data;
            let now = Date.now();
            let timeStamp = timeData.timeStamp;
            let diff = timeStamp - now;
            if (diff  <= 0) {
                this.notify();
            } else {
                this.timeoutKey = setTimeout(() => {
                    this.notify();
                }, diff);
            }
        }
    }

    componentWillUnmount() {
        if (this.timeoutKey) {
            clearTimeout(this.timeoutKey);
        }
    }

    notify() {
        const {index, data, onActive} = this.props;
        notify('亲，你还有事件没做哦', data[TODO_CONFIG.RENDER_STRING_KEY]);
        onActive(index);
    }

    formatTime(date) {
        return date.toLocaleString();
    }

    render() {
        const {data} = this.props.data;
        let nextTime = this.formatTime(data);
        return (
            <span className='time'>
                <ToolTip title={nextTime}>
                    <i className='iconfont icon-time-circle'/>
                </ToolTip>
            </span>
        )
    }
}