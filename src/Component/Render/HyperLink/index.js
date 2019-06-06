import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import cs from 'classnames';
import './index.scss';

export default class HyperLink extends PureComponent {
    static propTypes = {
        data: PropTypes.object.isRequired,
    };

    jumpTo(url) {
        if (!url.startsWith('http')) {
            url = `https://${url}`;

        }

        try {
            const { shell } = window.require('electron');
            shell.openExternal(url);
        } catch (e) {
            window.open(url, '_blank');
        }


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