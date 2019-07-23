import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
// import cs from 'classnames';
import './index.scss';

let popup = null;
let appendAnchor = null;

const createContainer = () => {
    const div = document.createElement('div');
    div.className = 'modal';
    return div;
};

const getAnchor = () => {
    if (appendAnchor) {
        return appendAnchor;
    } else {
        appendAnchor = document.querySelector('#todo-app');
        return appendAnchor;
    }
};

export default class BaseModal extends PureComponent {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        children: PropTypes.object,
    };

    componentWillUpdate(newProps) {
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
                    <div className="mask">
                        {React.cloneElement(children, props)}
                    </div>, popup
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