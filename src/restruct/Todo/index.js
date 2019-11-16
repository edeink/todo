import './index.scss';

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import Input from "../../Component/Exclusive/Input";
import {DROP_TYPE} from "../../tool/drag";
import TODO_CONFIG from "../../config";
import DAO from '../../data';
import List from './List';
import Category from "../../Component/Exclusive/Category";

const {
    LIMIT_WORDS,
} = TODO_CONFIG;

export default class Todo extends PureComponent {
    static propTypes = {
        openTool: PropTypes.bool.isRequired,
    };

    state = {
        category: [],
        activeCategoryKey: null,
        data: [],
        inputValue: '',
    };

    componentDidMount() {
        const category = DAO.readCategory();
        let activeCategoryKey = null;
        // 获取激活的页签
        category.some(function (eachCategory) {
            if (eachCategory.isActive()) {
                activeCategoryKey = eachCategory.getKey();
                return true;
            }
            return false;
        });
        if (!activeCategoryKey) {
            activeCategoryKey = category[0].getKey();
        }
        this.setState({
            category,
        });
        this.updateDataByCategoryChange(activeCategoryKey);
    }

    updateDataList = (data) => {
        this.setState({
            data: [
                ...data
            ]
        })
    };

    // category
    updateDataByCategoryChange = (activeCategoryKey) => {
        const {activeCategory: preActiveCategoryKey} = this.state;
        // 键相同时，不更新
        if (preActiveCategoryKey && activeCategoryKey === preActiveCategoryKey) {
            return;
        }
        this.setState({
            activeCategoryKey,
            data: DAO.readData({
                category: activeCategoryKey
            })
        })
    };

    handleChangeCategory = () => {

    };

    handleActiveCategory = (key) => {
        this.updateDataByCategoryChange(key);
    };

    handleDeleteCategory = () => {

    };

    // input
    handleInputEnter = (value) => {
        const {data} = this.state;
        const newData = DAO.createData(value);
        this.setState({
            inputValue: '',
            data: [
                ...data,
                newData,
            ],
        });
    };

    handleInputChange = (value) => {
        this.setState({
            inputValue: value,
        })
    };

    render() {
        const {openTool} = this.props;
        const {inputValue, data, category, activeCategoryKey} = this.state;
        return (
            <div className={cs('app-wrapper', {'open-tool': openTool})}>
                <List data={data} onUpdate={this.updateDataList}/>
                {/* 分类 */}
                {
                    category && category.length > 0 &&
                    <Category
                        activeKey={activeCategoryKey}
                        options={category}
                        onChange={this.handleChangeCategory}
                        onActive={this.handleActiveCategory}
                        onDelete={this.handleDeleteCategory}/>
                }
                <Input
                    id={DROP_TYPE.INPUT}
                    value={inputValue}
                    max={LIMIT_WORDS}
                    onEnter={this.handleInputEnter}
                    onChange={this.handleInputChange}/>
            </div>
        )
    }
}