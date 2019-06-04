import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';

export default class Time extends PureComponent {
    static propTypes = {
        data: PropTypes.object.isRequired,
    };

    render() {
        return (
            <div className='time'>
                <i className='iconfont icon-time-circle'></i>
            </div>
        )
    }
}