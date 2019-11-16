// import './index.scss';

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Status from "../Status";
import Tool, {ToolBtn} from "../Tool";
import ToolTip from "../../Common/ToolTip";
import Uploader, {ACCEPT_TYPE} from "../../Common/Uploader";
import ColorTheme from "../ColorTheme";
import eventHelper from "../../../tool/event";

export default class ToolBar extends PureComponent {
    static propTypes = {
        isActive: PropTypes.bool.isRequired,
        onToggleTool: PropTypes.func.isRequired,
    };

    onSave() {
        eventHelper.dispatch(eventHelper.TYPE.SAVE_DATA);
    }

    onRead(data) {
        eventHelper.dispatch(eventHelper.TYPE.READ_DATA, {data});
    }

    onChangeTheme(theme) {
        eventHelper.dispatch(eventHelper.TYPE.CHANGE_THEME, {theme});
    }

    render() {
        const {isActive, onToggleTool} = this.props;
        return (
            <React.Fragment>
                {/* 当前状态栏 */}
                <Status onClick={onToggleTool}
                        isActive={isActive}/>
                <Tool isActive={isActive} onClose={onToggleTool}>
                    <ToolTip title="导出配置">
                        <ToolBtn type='download' onClick={this.onSave}/>
                    </ToolTip>
                    <ToolTip title="导入配置">
                        <Uploader type={ACCEPT_TYPE.JSON} onChange={this.onRead}>
                            <ToolBtn type='upload'/>
                        </Uploader>
                    </ToolTip>
                    <ColorTheme onChange={this.onChangeTheme}/>
                </Tool>
            </React.Fragment>
        )
    }
}