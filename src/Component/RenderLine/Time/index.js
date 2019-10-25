import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import cs from 'classnames';

import ToolTip from '../../Common/ToolTip';
import Calendar from "../../Common/Calendar";

import TODO_CONFIG from '../../../config'
import {notify} from "../../../tool/adaptor";

import './index.scss';
import BaseModal from "../../Common/Modal/BaseModal";

export default class Time extends Component {
    static propTypes = {
        index: PropTypes.number,
        data: PropTypes.object.isRequired,
        disabled: PropTypes.bool,
        time: PropTypes.number,
        isActive: PropTypes.bool,
        onActive: PropTypes.func,
        onChange: PropTypes.func.isRequired,
    };

    state = {
        timestamp: 0,
        diffTime: '',
        showCalendar: false,
    };

    componentDidMount() {
        const {data, disabled, onActive, time, isActive} = this.props;
        const {data: timeData} = data;
        // 传入的time优先级高于数据中的time
        let timestamp = time || timeData.timeStamp;
        if (data && onActive && !disabled && !isActive) {

            let now = Date.now();


            let diff = timestamp - now;
            if (diff <= 0) {
                // 通知
                this.notify();
            } else {
                // 计时
                this.updateTime();
                this.timeoutKey = setTimeout(() => {
                    this.notify();
                }, diff);
            }
        }

        this.setState({
            timestamp: timestamp
        });
    }

    componentWillUnmount() {
        if (this.timeoutKey) {
            clearTimeout(this.timeoutKey);
        }
    }

    openCalendar = () => {
        this.setState({
            showCalendar: true
        });
    };

    handleSelectTime = (selectTime) => {
        const {onChange} = this.props;
        this.setState({
            showCalendar: false
        }, () => {
            onChange(selectTime);
        });
    };

    // 通知
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

    // 更新实时时间
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

    // 获得时间差异
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
        const {timestamp, diffTime, showCalendar} = this.state;
        let localDateStr = timestamp === 0 ? new Date().toLocaleString() : new Date(timestamp).toLocaleString();
        return (
            <span className='time'>
                <ToolTip title={localDateStr}>
                    <span onClick={this.openCalendar}>
                        <i className='iconfont icon-time-circle'/>
                        {diffTime && <span className="diff-time">{diffTime}</span>}
                    </span>
                </ToolTip>
                <BaseModal show={showCalendar}>
                    <Calendar timestamp={timestamp} onSelect={this.handleSelectTime}/>
                </BaseModal>
            </span>
        )
    }
}