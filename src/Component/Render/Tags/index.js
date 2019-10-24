import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
// import cs from 'classnames';
import './index.scss';

export default class Tags extends PureComponent {
    static propTypes = {
        data: PropTypes.object.isRequired,
        onDblClick: PropTypes.func,
    };

    onDoubleClick = (eachTag) => {
        const {onDblClick} = this.props;
        onDblClick(eachTag);
    };

    render() {
        const {data} = this.props.data;
        if (!data || !Array(data.tags) || data.tags.length === 0) {
            return null;
        }
        return (
            <span className='tags'>
                {
                    data.tags.map((eachTag) => {
                        return <span className='tag' key={eachTag}
                                     onDoubleClick={() => {
                                         this.onDoubleClick(eachTag)
                                     }}>{eachTag}</span>
                    })
                }
            </span>
        )
    }
}