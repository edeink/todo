import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import cs from 'classnames';
import './index.scss';

export default class Tags extends PureComponent {
    static propTypes = {
        data: PropTypes.object.isRequired,
    };

    render() {
        const {data} = this.props.data;
        if(!data || data.length === 0) {
            return null;
        }
        return (
            <span className='tags'>
                {
                    data.map(function (eachData) {
                        return <span className='tag' key={eachData}>{eachData}</span>
                    })
                }
            </span>
        )
    }
}