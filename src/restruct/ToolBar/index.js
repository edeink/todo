import './index.scss';

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Status from "../../Component/Exclusive/Status";
import Tool, {ToolBtn} from "../../Component/Exclusive/Tool";
import ToolTip from "../../Component/Common/ToolTip";
import Uploader, {ACCEPT_TYPE} from "../../Component/Common/Uploader";
import ColorTheme from "../../Component/Exclusive/ColorTheme";

export default class ToolBar extends PureComponent {
    static propTypes = {
        isActive: PropTypes.bool.isRequired,
        onToggle: PropTypes.func.isRequired,
        onChangeTheme: PropTypes.func.isRequired,
    };

    handleSave = () => {

    };

    handleRead = () => {

    };

    render() {
        const {isActive, onToggle, onChangeTheme} = this.props;
        return (
            <React.Fragment>
                <Status isActive={isActive} onClick={onToggle}/>
                <Tool isActive={isActive} onClose={onToggle}>
                    <ToolTip title="导出配置">
                        <ToolBtn type='download' onClick={this.handleSave}/>
                    </ToolTip>
                    <ToolTip title="导入配置">
                        <Uploader type={ACCEPT_TYPE.JSON} onChange={this.handleRead}>
                            <ToolBtn type='upload'/>
                        </Uploader>
                    </ToolTip>
                    <ColorTheme onChange={onChangeTheme}/>
                </Tool>
            </React.Fragment>
        )
    }
}