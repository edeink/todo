import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
// import cs from 'classnames';
import './index.scss';

export default class Emphasize extends PureComponent {
    static propTypes = {
        data: PropTypes.object.isRequired,
    };

    render() {
        const {key, data} = this.props.data;
        if (!data) {
            return null;
        }
        return (
            <span className={key}>{data.value}</span>
        )
    }
}