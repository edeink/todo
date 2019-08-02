import React, {Component} from 'react';
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
        time: PropTypes.number,
        isActive: PropTypes.bool,
    };

    state = {
        time: 0,
        diffTime: '',
    };

    componentDidMount() {
        const {data, disabled, onActive, time, isActive} = this.props;
        if (data && onActive && !disabled && !isActive) {
            const {data: timeData} = data;
            let now = Date.now();

            // 传入的time优先级高于数据中的time
            let timeStamp = time || timeData.timeStamp;
            let diff = timeStamp - now;
            if (diff <= 0) {
                this.notify();
            } else {
                this.updateTime();
                this.timeoutKey = setTimeout(() => {
                    this.notify();
                }, diff);
            }

            this.setState({
                time: time || timeData.timeStamp
            });
        }
    }

    componentWillUnmount() {
        if (this.timeoutKey) {
            clearTimeout(this.timeoutKey);
        }
    }

    notify() {
        const {index, data, onActive} = this.props;
        notify('约定时间到！', data[TODO_CONFIG.RENDER_STRING_KEY]);
        if (this.updateTimeKey) {
            clearTimeout(this.updateTimeKey);
        }
        this.setState({
            diffTime: ''
        }, () => {
            onActive(index);
        });
    }

    updateTime = () => {
        this.setState({
            diffTime: this.getDiffTime()
        });
        this.updateTimeKey = setInterval(() => {
            this.setState({
                diffTime: this.getDiffTime()
            });
        }, 1000);
    };

    getDiffTime = () => {
        const {time} = this.props;
        let diffTime = time - Date.now();
        let second = Math.floor(diffTime / 1000);
        let minute = Math.floor(second / 60);
        let hour = Math.floor(minute / 60);
        let day = Math.floor(hour / 24);

        if (day > 0) {
            return `>${day}d`;
        } else if (hour > 0) {
            return `>${hour}h`;
        } else if (minute > 0) {
            return `>${minute}m`;
        } else if (second > 0) {
            return `${second}s`;
        }


    };

    render() {
        const {time, diffTime} = this.state;
        let date = time === 0 ? new Date().toLocaleString() : new Date(time).toLocaleString();
        return (
            <span className='time'>
                <ToolTip title={date}>
                    <span>
                        <i className='iconfont icon-time-circle'/>
                        {diffTime && <span className="diff-time">{diffTime}</span>}
                    </span>
                </ToolTip>
            </span>
        )
    }
}