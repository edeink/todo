import './index.scss';

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import EachLine from './EachLine';
import {DeleteEmptyCategory} from "../../../Component/Exclusive/Category";

export default class List extends PureComponent {
    static propTypes = {
        data: PropTypes.array.isRequired,
        onUpdate: PropTypes.func.isRequired,
    };

    onDelete = (index) => {
        const {data, onUpdate} = this.props;
        data.splice(index, 1);
        onUpdate(data);
    };

    onCheck = (index, done) => {
        const {data, onUpdate} = this.props;
        data[index].todo(done);
        onUpdate(data);
    };

    render() {
        const {data} = this.props;
        const isEmpty = !(data && data.length > 0);
        return <div className="list-container">
            {
                isEmpty && <DeleteEmptyCategory/>
            }
            {/* 已完成 */}
            <div className="list undo-list">
                {
                    data.map((eachData, index) => {
                        if (!eachData.isDone()) {
                            return <EachLine
                                key={eachData.getString()}
                                data={eachData}
                                onCheck={() => this.onCheck(index, true)}
                                onClose={() => this.onDelete(index)}
                            />
                        }
                        return null;
                    })
                }
            </div>
            <div className="done-split"/>
            {/* 未完成 */}
            <div className="list done-list">
                {
                    data.map((eachData, index) => {
                        if (eachData.isDone()) {
                            return <EachLine
                                key={eachData.getString()}
                                data={eachData}
                                onCheck={() => this.onCheck(index, false)}
                                onClose={() => this.onDelete(index)}/>
                        }
                        return null;
                    })
                }
            </div>
        </div>

    }
}