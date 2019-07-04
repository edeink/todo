import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';
import ToolTip from "../../Common/ToolTip";

export const THEME = {
    DEFAULT: {
        title: '黑夜',
        className: 'black'
    },
    WHITE: {
        title: '白昼',
        className: 'white'
    }
};

const THEME_KEY = Object.keys(THEME);

const store = window.localStorage;
const THEME_STORE_KEY = '__theme';

export default class ColorTheme extends PureComponent {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
    };

    state = {
        activeTheme: '',
    };

    static getTheme() {
        let themeValue = store.getItem(THEME_STORE_KEY) || 'DEFAULT';
        return THEME[themeValue].className;
    }

    componentDidMount() {
        let themeValue = store.getItem(THEME_STORE_KEY) || 'DEFAULT';
        this.onChange(themeValue, true);
    }

    onChange = (activeTheme, init) => {
        if (!init) {
            store.setItem(THEME_STORE_KEY, activeTheme);
        }
        this.setState({
            activeTheme
        });
        this.props.onChange(THEME[activeTheme].className);
    };

    render() {
        const {activeTheme} = this.state;
        return (
            <div className="color-theme">
                <span className="color-title">主题色：</span>
                {
                    THEME_KEY.map((eachKey) => {
                        let currTheme = THEME[eachKey];
                        return (
                            <ToolTip key={eachKey} title={currTheme.title}>
                                <span className={cs('color-block', currTheme.className,
                                    {'is-active': activeTheme === eachKey})}
                                      onClick={() => {
                                          this.onChange(eachKey)
                                      }}/>
                            </ToolTip>
                        )
                    })
                }
            </div>
        )
    }
}