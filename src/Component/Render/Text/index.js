import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';

export default class Text extends PureComponent {
    static propTypes = {
        data: PropTypes.object.isRequired,
    };

    render() {
        const {data} = this.props;
        return (
            <div className='text'>{data.content}</div>
        )
    }
}