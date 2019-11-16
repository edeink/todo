import './index.scss';

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import Checkbox from "../../../../Component/Common/Checkbox";
import CloseBtn from "../../../../Component/Common/CloseBtn";

export default class EachLine extends PureComponent {
    static propTypes = {
        data: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
        onCheck: PropTypes.func.isRequired,
    };

    render() {
        const {data, onClose, onCheck} = this.props;
        const done = data.isDone();
        return (
            <li className={cs("li", {checked: done})}>
                <Checkbox checked={done} small={done} onChange={onCheck}/>
                <div className="message">{data.getString()}</div>
                <CloseBtn onClick={onClose}/>
            </li>
        )
    }
}