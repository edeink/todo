import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';

export default class Checkbox extends PureComponent {
    static propTypes = {
        // 是否选中
        checked: PropTypes.bool,
        // 尺寸变小
        small: PropTypes.bool,
        // 选中状态变更
        onChange: PropTypes.func,
    };

    toggleChecked = () => {
        const {onChange, checked} = this.props;
        onChange && onChange(!checked);
    };

    render() {
        const {checked, small} = this.props;
        return (
            <div className={cs("checkbox", {'checked': checked, 'small': small})}
                 onClick={this.toggleChecked}/>
        )
    }
}