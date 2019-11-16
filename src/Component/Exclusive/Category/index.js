import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';
import ToolTip from "../../Common/ToolTip";
import Confirm from "../../Common/Modal/Confirm";
import TODO_CONFIG from '../../../config';
import KEYCODE from "../../../tool/keycode";
import eventHelper from "../../../tool/event";

const store = window.localStorage;

const {STORE_CATEGORY_KEY, STORE_ACTIVE_CATEGORY_KEY} = TODO_CONFIG;

export default class Category extends PureComponent {
    static propTypes = {
        activeKey: PropTypes.string.isRequired,
        options: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
        onActive: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            focusIndex: -1,
            focusKey: null,
            focusValue: '',
        }
    }

    componentDidMount() {
        window.addEventListener(eventHelper.TYPE.DELETE_CATEGORY, this.onDelete)
    }

    componentWillUnmount() {
        window.removeEventListener(eventHelper.TYPE.DELETE_CATEGORY, this.onDelete);
    }

    // 删除并存储
    onDelete = () => {
        const {activeKey, options, onDelete} = this.props;
        let activeIndex = -1;
        options.some(function (eachOption, index) {
           if (eachOption.key === activeKey) {
               activeIndex = index
               return true;
           }
           return false;
        });
        if (activeIndex !== -1) {
            options.splice(activeIndex, 1);
            activeIndex = activeIndex - 1 >=0 ? activeIndex - 1 : 0;
            store.setItem(STORE_CATEGORY_KEY, JSON.stringify(options));
            onDelete && onDelete(options[activeIndex].key, options)
        }
    };

    onClick = (key) => {
        this.onActive(key);
    };

    onKeyDown = (event) => {
        if (event.nativeEvent.keyCode === KEYCODE.ENTER) {
            const {focusKey} = this.state;
            this.onBlur(focusKey);
        }
    };

    onFocus = (key, value, index) => {
        this.setState({
            focusKey: key,
            focusValue: value,
            focusIndex: index
        })
    };

    onActive = (key) => {
        store.setItem(STORE_ACTIVE_CATEGORY_KEY, key);
        this.props.onActive(key);
    };

    onBlur = (key) => {
        const {activeKey, options, onDelete} = this.props;
        const {focusIndex, focusKey, focusValue} = this.state;
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
                onDelete(activeKey, options);
            }
            return false;
        }

        // 有内容
        if (modifyCategory.isNew === true) {
            modifyCategory = {
                key: focusValue,
                value: focusValue,
            };
        } else {
            modifyCategory.value = focusValue;
        }
        options[focusIndex] = modifyCategory;
        store.setItem(STORE_CATEGORY_KEY, JSON.stringify(options));
        this.onActive(modifyCategory.key);
    };

    onValueChange = (event) => {
        this.setState({
            focusValue: event.target.value,
        });
    };

    addEmptyCategory = () => {

        const {options, onChange} = this.props;
        let newOptions = [...options];
        let randomKey = '' + Math.random();
        let emptyCategory = {key: randomKey, value: '', isNew: true};
        newOptions.push(emptyCategory);
        onChange(newOptions);
        this.setState({
            focusIndex: options.length,
            focusKey: randomKey,
        })

    };

    _renderEachCategory(key, value, index) {
        const {focusKey, focusValue} = this.state;
        const {activeKey} = this.props;
        const isFocus = key === focusKey;
        return (
            <li key={key}
                className={cs({'is-active': key === activeKey, 'is-focus': isFocus})}
                onDoubleClick={() => {
                    this.onFocus(key, value, index)
                }}
                onClick={() => {
                    this.onClick(key)
                }}>
                {
                    isFocus ?
                        <input autoFocus
                               className={'category-input'}
                               value={focusValue}
                               onBlur={() => {
                                   this.onBlur(key)
                               }}
                               onKeyPress={this.onKeyDown}
                               onChange={this.onValueChange}/> :
                        <ToolTip title={value}><span>{value}</span></ToolTip>
                }
            </li>
        )
    }

    render() {
        const {options} = this.props;
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

/**
 * 删除空页签按钮
 */
export class DeleteEmptyCategory extends PureComponent {
    state = {
        confirmDelete: false,
    };

    showConfirm = () => {
        this.setState({confirmDelete: true});
    };

    onConfirm = () => {
        this.setState({confirmDelete: false}, function () {
            eventHelper.dispatch(eventHelper.TYPE.DELETE_CATEGORY)
        });
    };

    onConfirmCancel = () => {
        this.setState({confirmDelete: false});
    };

    render() {

        const {confirmDelete} = this.state;
        return (
            <React.Fragment>
                <div className="category-delete" onClick={this.showConfirm}>点击删除空页签</div>
                {/*确认信息*/}
                <Confirm show={confirmDelete}
                         title="将清空当前页签下的列表"
                         onOk={this.onConfirm}
                         onCancel={this.onConfirmCancel}/>
            </React.Fragment>
        )
    }
}