import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';
import ToolTip from "../../Common/ToolTip";
import TODO_CONFIG from '../../../config';
import KEYCODE from "../../../tool/keycode";

const store = window.localStorage;

const {STORE_CATEGORY_KEY} = TODO_CONFIG;
const DELETE_KEY = ':d'; // 删除

export default class Category extends PureComponent {
    static propTypes = {
        activeKey: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        options: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            focusIndex: -1,
            focusKey: null,
            options: props.options,
            focusValue: '',
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.options !== this.props.options) {
            this.setState({
                options: newProps.options
            });
        }
    }

    onClick = (key) => {
        this.props.onChange(key);
    };

    onKeyDown = (event) => {
        if (event.nativeEvent.keyCode === KEYCODE.ENTER) {
            const {focusKey} = this.state;
            this.onBlur(focusKey);
        }
    };

    onFocus = (key, value, index) => {
        this._preValue = value;
        this.setState({
            focusKey: key,
            focusValue: value,
            focusIndex: index
        })
    };

    deleteOption = (index) => {
        const {options} = this.state;
        options.splice(index, 1);
        this.setState({
            options: [...options]
        });
        store.setItem(STORE_CATEGORY_KEY, JSON.stringify(options));
    };

    onBlur = (key) => {
        const {focusIndex, focusKey, focusValue, options} = this.state;
        if (key === focusKey) {
            this.setState({
                focusIndex: -1,
                focusValue: '',
                focusKey: null,
            })
        }

        // 没有输入内容
        let modifyCategory = options[focusIndex];
        if (!focusValue) {
            if (modifyCategory && modifyCategory.isNew === true) {
               this.deleteOption(focusIndex);
            }
            return false;
        }

        // 有内容
        if (focusValue === DELETE_KEY) {
            // 特殊的键值
            this.deleteOption(focusIndex);
            return false;
        } else if (modifyCategory.isNew === true) {
            modifyCategory = {
                key: focusValue,
                value: focusValue,
            };
        } else {
            modifyCategory.value = focusValue;
        }
        options[focusIndex] = modifyCategory;
        store.setItem(STORE_CATEGORY_KEY, JSON.stringify(options));
        this.props.onChange(modifyCategory.key);
    };

    onValueChange = (event) => {
        this.setState({
            focusValue: event.target.value,
        });
    };

    addEmptyCategory = ()  => {
        const {options} = this.state;
        let newOptions = [...options];
        let randomKey = '' + Math.random();
        let emptyCategory = {key: randomKey, value: '', isNew: true};
        newOptions.push(emptyCategory);
        this.setState({
            focusIndex: options.length,
            focusKey: randomKey,
            options: newOptions
        })
    };

    _renderEachCategory(key, value, index) {
        const {focusKey, focusValue} = this.state;
        const {activeKey} = this.props;
        const isFocus = key === focusKey;
        return (
            <li key={key}
                className={cs({'is-active': key === activeKey, 'is-focus': isFocus})}
                onDoubleClick={() => {this.onFocus(key, value, index)}}
                onClick={() => {this.onClick(key)}}>
                {
                    isFocus ?
                        <input autoFocus
                               className={'category-input'}
                               value={focusValue}
                               onBlur={() => {this.onBlur(key)}}
                               onKeyPress={this.onKeyDown}
                               onChange={this.onValueChange}/> :
                        <ToolTip title={value}><span>{value}</span></ToolTip>
                }
                </li>
        )
    }

    render() {
        const {options} = this.state;
        return (
            <div className="todo-category">
                <ul>
                    {
                        options.map((eachOption, index) => {
                            const {key, value} = eachOption;
                            return this._renderEachCategory(key, value, index);
                        })
                    }
                    <li className={'add-category'} onClick={this.addEmptyCategory}>
                        <ToolTip title={'添加分类'}>
                            <i className={`iconfont icon-plus`}/>
                        </ToolTip>
                    </li>
                </ul>
            </div>
        )
    }
}