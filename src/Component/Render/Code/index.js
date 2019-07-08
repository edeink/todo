import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

export default class Code extends PureComponent {
    static propTypes = {
        data: PropTypes.object.isRequired,
    };

    render() {
        const {data} = this.props.data;
        return (
            <pre className='code'>{data.value}</pre>
        )
    }
}