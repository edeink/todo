import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';

export default class CloseBtn extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        onClick: PropTypes.func.isRequired,
    };

    onClick = (event) => {
        this.props.onClick(event);
    };

    render() {
        const {className} = this.props;
        return (
            <button className={cs('cross', 'close-btn', className)}
                    onClick={this.onClick}/>
        )
    }
}