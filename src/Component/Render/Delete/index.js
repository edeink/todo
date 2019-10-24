import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
// import cs from 'classnames';
import './index.scss';

export default class Delete extends PureComponent {
    static propTypes = {
        data: PropTypes.object.isRequired,
    };

    render() {
        const {data} = this.props.data;
        return (
            <span className='delete'>{data.value}</span>
        )
    }
}