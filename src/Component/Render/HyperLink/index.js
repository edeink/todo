import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import cs from 'classnames';

import {goToUrl} from "../../../tool/adaptor";

import './index.scss';

export default class HyperLink extends PureComponent {
    static propTypes = {
        data: PropTypes.object.isRequired,
    };

    jumpTo(url) {
        if (!url.startsWith('http')) {
            url = `https://${url}`;

        }
        goToUrl(url);
    }

    render() {
        const {data} = this.props.data;
        return (
            <span className='hyperlink'>
                <button onClick={() => {this.jumpTo(data.link)}}>{data.value}</button>
            </span>
        )
    }
}