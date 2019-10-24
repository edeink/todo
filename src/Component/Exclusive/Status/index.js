import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';
import ToolTip from "../../Common/ToolTip";

export default class Status extends PureComponent {
    static propTypes = {
        isActive: PropTypes.bool.isRequired,
        onClick: PropTypes.func,
        onMouseEnter: PropTypes.func,
        onMouseLeave: PropTypes.func,
    };

    state = {
        isActive: false
    };

    render() {
        const {isActive, onClick, onMouseEnter, onMouseLeave} = this.props;
        return (
            <div className={cs('status', {'is-active': isActive})}
                 onMouseEnter={onMouseEnter}
                 onMouseLeave={onMouseLeave}
                 onClick={onClick}>
                <ToolTip title={'设置'}>
                    <i className={`iconfont icon-setting`}/>
                </ToolTip>
            </div>
        )
    }
}