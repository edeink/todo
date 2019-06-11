import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import cs from 'classnames';

import {goToUrl} from "../../../tool/adaptor";

import './index.scss';
import Tip from "../../Exclusive/Tip";
import ToolTip from "../../Common/ToolTip";

export default class HyperLink extends PureComponent {
    static propTypes = {
        data: PropTypes.object.isRequired,
    };

    jumpTo(url) {
        let realUrl = url;
        if (!url.startsWith('http')) {
            realUrl = `https://${url}`;

        }
        goToUrl(realUrl, function () {
            Tip.showTip(`"${url}" 不是合法Url`);
        });
    }

    render() {
        const {data} = this.props.data;
        return (
            <span className='hyperlink'>
                <ToolTip title={data.link} direction="top">
                    <button onClick={() => {this.jumpTo(data.link)}}>{data.value}</button>
                </ToolTip>
            </span>
        )
    }
}