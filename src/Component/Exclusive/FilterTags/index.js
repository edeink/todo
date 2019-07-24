import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';

class Tag extends PureComponent {
    static propTypes = {
        title: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
    };

    state = {
        active: false
    };

    handleClick = () => {
        const {active} = this.state;
        const {title, onClick} = this.props;
        this.setState({
            active: !active,
        });
        onClick(title);
    };

    render() {
        const {title} = this.props;
        const {active} = this.state;
        return(
            <span className={cs('filter-tag', {'is-active': active})}
                  onClick={this.handleClick}>{title}</span>
        )
    }
}

export default class FilterTags extends PureComponent {
    static propTypes = {
        tags: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    state = {
        activeTags: [],
    };

    // 激活一个页签
    onTagActive = (title) => {
        const {onChange} = this.props;
        const {activeTags} = this.state;
        const newActiveTags = [...activeTags];
        let index = activeTags.indexOf(title);
        if (index !== -1) {
            newActiveTags.splice(index, 1);
        } else {
            newActiveTags.push(title);
        }
        this.setState({
            activeTags: newActiveTags
        });
        onChange(newActiveTags);
    };

    render() {
        const {tags} = this.props;
        return (
            <div className="filter-tag-list">
                {
                    tags.map((eachTag) => {
                        return <Tag key={eachTag} title={eachTag} onClick={this.onTagActive}/>
                    })
                }
            </div>
        )
    }
}