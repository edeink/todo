import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import cs from 'classnames';
import './index.scss';

export default class Time extends Component {
    static propTypes = {
        data: PropTypes.object.isRequired,
    };

    componentDidMount() {
        const {data} = this.props.data;
        console.log(data);
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <span className='time'>
                <i className='iconfont icon-time-circle'></i>
            </span>
        )
    }
}