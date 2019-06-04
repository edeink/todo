import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';

const STATUS = {
    GOOD: 'good',
    OK: 'ok',
    BUSY: 'busy',
};

export default class Status extends PureComponent {
    static propTypes = {
        length: PropTypes.number.isRequired,
        onClick: PropTypes.func,
    };

    render() {
        const {length, onClick} = this.props;
        const status = length <= 2 ? STATUS.GOOD : length <= 5 ? STATUS.OK : STATUS.BUSY;
        return (
            <div className={cs('status', status)} onClick={onClick}/>
        )
    }
}