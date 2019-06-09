import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import cs from 'classnames';
import './index.scss';
import fileHelper from "../../../tool/file";

const ACCEPT_TYPE = {
    JSON: 'json',
    TEXT: 'text',
};

export {ACCEPT_TYPE};

export default class Uploader extends PureComponent {
    static propTypes = {
        type: PropTypes.oneOf([ACCEPT_TYPE.JSON, ACCEPT_TYPE.TEXT]),
        onChange: PropTypes.func.isRequired,
        children: PropTypes.object,
        onMouseEnter: PropTypes.func,
        onMouseLeave: PropTypes.func,
    };

    handleClick = () => {
        this.refInput.click();
    }

    handleRead = (event) => {
        const {type, onChange} = this.props;
        switch(type) {
            case ACCEPT_TYPE.JSON: {
                fileHelper.readJson(event).then(function (data) {
                   onChange(data);
                });
                break;
            }
            case ACCEPT_TYPE.TEXT: {
                break;
            }
            default: {

            }
        }
    }

    render() {
        const {children, onMouseEnter, onMouseLeave} = this.props;
        return (
            <div className='upload-wrapper'
                 onMouseEnter={onMouseEnter}
                 onMouseLeave={onMouseLeave}
                 onClick={this.handleClick}>
                <input ref={comp => this.refInput = comp}
                       className="read" type="file" onChange={this.handleRead}/>
                { children }
            </div>
        )
    }
}