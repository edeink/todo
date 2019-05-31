import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';

export default class Checkbox extends PureComponent {
    static propTypes = {
        checked: PropTypes.bool,
        onChange: PropTypes.func,
        small: PropTypes.bool,
    }

    toggleChecked = () => {
        const {onChange, checked} = this.props;
        onChange && onChange(!checked);
    }
    render() {
        const {checked, small} = this.props;
        return (
            <div className={cs("checkbox", {'checked': checked, 'small': small})} 
                onClick={this.toggleChecked}></div>
        )
    }
}