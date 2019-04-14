import React, { PureComponent } from 'react';
import cs from 'classnames';

const KEYCODE = {
    ENTER: 13,
}

const STORE_KEY = '__todo-message';
const store = window.localStorage;

class App extends PureComponent {
    state = {
        message: [],
        tips: '',
        hello: '不来一发吗？',
        focus: '',
        value: '',
    }
    componentDidMount() {
        const message = JSON.parse(store.getItem(STORE_KEY)) || [];
        message.forEach(function (eachMessage) {
            eachMessage.em = false;
        })
        this.setState({ message: [...message] })
    }
    handleKeydown = (event) => {
        if (event.nativeEvent.keyCode === KEYCODE.ENTER) {
            const input = this.refs.input;
            const success = this.insert(input.value);
            if (success) {
                input.value = '';
                this.setState({
                    value: ''
                });
            }
        }
    }
    tips = (tips) => {
        this.setState({ tips });
        if (this.tipsTimout) {
            clearTimeout(this.tipsTimout);
            this.tipsTimout = null;
        }
        this.tipsTimout = setTimeout(() => {
            this.setState({ tips: '' });
        }, 2000);
    }
    getTips(value) {
        const { message } = this.state;
        const length = value.length;
        let findIndex = -1;
        message.some((eachMessage, index) => {
            if (eachMessage.value === value) {
                findIndex = index;
                return true;
            }
            return false;
        });
        if (length === 0) {
            return '哈哈哈，小哑巴！';
        }
        if (value.length === 1) {
            return '一个字？太吝啬了吧？';
        }
        if (value.length > 10) {
            return '言简意赅不好吗？';
        }
        if (message.length >= 6) {
            return '装不下啦，快去干活！';
        }
        if (findIndex !== -1) {
            this.em(findIndex);
            return '你已经说过啦！真啰嗦~'
        }
    }

    insert(value) {
        const { message } = this.state;
        const tips = this.getTips(value)
        if (tips) {
            this.tips(tips);
            return false;
        }
        message.unshift({
            value: value,
            em: true
        });
        store.setItem(STORE_KEY, JSON.stringify(message));
        this.setState({
            message: [...message]
        })
        return true;
    }
    em = (index) => {
        const { message } = this.state;
        message[index].em = true;
        this.setState({
            message: [...message]
        });
        setTimeout(() => {
            message[index].em = false;
            this.setState({
                MESSAGE: [...message]
            })
        }, 2000);
    }
    delete = (index, event) => {
        let { message } = this.state;
        message.splice(index, 1);
        store.setItem(STORE_KEY, JSON.stringify(message));
        this.setState({
            message: [...message]
        });
        event.stopPropagation();
        event.preventDefault();
    }
    handleClickApp = () => {
        const { message } = this.state;
        if (!message || message.length === 0) {
            this.refs.input.focus();
        }
    }
    handleStop = (event) => {
        event.stopPropagation();
        event.preventDefault();
    }
    changeMessage = (index, event) => {
        const { message } = this.state;
        const activeMessage = message[index];
        const input = this.refs.input;
        input.value = activeMessage.value;
        input.focus();
        this.setState({
            value: activeMessage.value
        });
    }
    handleFocus = (event) => {
        this.setState({ focus: true });
    }
    handleBlur = (event) => {
        let { message } = this.state;
        message.forEach((eachMessage) => {
            eachMessage.em = false;
        });
        this.setState({ focus: false, message: [...message] });
    }
    emptyInput = (event) => {
        const input = this.refs.input;
        input.value = '';
        input.focus();
        this.setState({
            value: ''
        });
        event.stopPropagation();
    }
    changeValue = () => {
        const value = this.refs.input.value;
        this.setState({ value })
    }
    render() {
        const { message, tips, hello, focus, value } = this.state;
        let status = message.length <= 1 ? 'good' : message.length <= 4 ? 'ok' : 'busy';
        return (
            <div className="todo-app" tabIndex="0">
                <div className="app-wrapper" onClick={this.handleClickApp}>
                    {
                        !(message && message.length > 0) &&
                        <div className={cs("hello", { "focus": focus })}>{hello}</div>
                    }
                    <div className={cs("tips", { "is-active": tips })}>{`${tips}`}</div>
                    <div className={cs('status', status)}></div>
                    <ul className={cs({ "focus": focus || tips, "normal": !focus })}>
                        {
                            message.map((eachMessage, index) => {
                                return <li key={index}
                                    className={cs({ "em": eachMessage.em })}
                                    onClick={this.handleStop}
                                    onDoubleClick={(event) => { this.changeMessage(index, event) }}>
                                    <span className="message">{eachMessage.value}</span>
                                    <button className="cross close" onClick={(event) => { this.delete(index, event) }}></button>
                                </li>
                            })
                        }
                    </ul>
                    <div className="input-wrapper">
                        <input className={cs("input", { "focus": focus })} ref="input"
                            onFocus={this.handleFocus}
                            onBlur={this.handleBlur}
                            onChange={this.changeValue}
                            onClick={this.handleStop}
                            onKeyPress={this.handleKeydown} />
                        {
                            <button className={cs("cross close", { 'hidden': !focus || !value })}
                                onClick={(event) => { this.emptyInput(event) }}></button>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
