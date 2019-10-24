import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import cs from 'classnames';
import './index.scss';
import BaseModal from "../BaseModal";
import CloseBtn from "../../CloseBtn";

export default class Confirm extends PureComponent {
    static propTypes = {
        // 显示
        show: PropTypes.bool.isRequired,
        // 标题
        title: PropTypes.string.isRequired,
        // 点击回调
        onOk: PropTypes.func,
        onCancel: PropTypes.func,
    };

    render() {
        const {show, title, onOk, onCancel} = this.props;
        return (
            <BaseModal show={show}>
                <div className="confirm animated bounceIn">
                    <CloseBtn onClick={() => {onCancel && onCancel()}}/>
                    <div className="title">{title}</div>
                    <div className="btn-group">
                        <button onClick={onCancel}>取消</button>
                        <button className="yes" onClick={onOk}>确定</button>
                    </div>
                </div>
            </BaseModal>
        )
    }
}