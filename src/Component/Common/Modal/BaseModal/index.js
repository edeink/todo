import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './index.scss';

let popup = null;
let appendAnchor = null;

// 获取最外层的容器div
const createContainer = () => {
    const div = document.createElement('div');
    div.className = 'modal';
    return div;
};

// 获取依附在上面的div
const getAnchor = () => {
    if (appendAnchor) {
        return appendAnchor;
    } else {
        appendAnchor = document.querySelector('#todo-app');
        return appendAnchor;
    }
};

/**
 * 弹出空白的框
 */
export default class BaseModal extends Component {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        children: PropTypes.object,
    };

    shouldComponentUpdate(newProps) {
        const {show, children} = this.props;
        if (show !== newProps.show) {
            if (newProps.show === false) {
                if (popup && appendAnchor) {
                    ReactDOM.unmountComponentAtNode(popup);
                    appendAnchor.removeChild(popup);
                }
            } else {
                if (!children) {
                    // do nothing
                    return false;
                }
                if (!popup) {
                    popup = createContainer();
                }
                if (!appendAnchor) {
                    appendAnchor = getAnchor();
                }
                appendAnchor.appendChild(popup);

                // 移除属性show
                let props = Object.assign({}, newProps);
                props.show = null;

                ReactDOM.render(
                    React.cloneElement(
                        <React.Fragment>
                            <div className="mask"/>
                            <div className="container animated bounceIn">
                                {children}
                            </div>
                        </React.Fragment>
                    , props)
                   , popup
                );
            }
            return true;
        }
        return false;
    }

    render() {
        return null;
    }
}