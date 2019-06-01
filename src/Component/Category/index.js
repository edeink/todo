import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';

export default class Category extends PureComponent {
    static propTypes = {
        activeKey: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        options: PropTypes.array.isRequired,
    };

    onClick = (key) => {
        this.props.onChange(key);
    };

    render() {
        const {activeKey, options} = this.props;
        return (
            <div className="todo-category">
                <ul>
                    {
                        options.map((eachOption) => {
                            const {key, value} = eachOption;
                            return <li key={key} 
                            className={cs({'is-active': key === activeKey})}
                            onClick={() => {this.onClick(key)}}>{value}</li>
                        })
                    }
                </ul>
            </div>
        )
    }
}