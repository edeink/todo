import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import './index.scss';

const weekArray = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sept: 8, Oct: 9, Nov: 10, Dec: 11,
};

function getDay(year, month, date) {
    return {
        year, month, date
    }
}

const nowTime = new Date();
const nowYear = nowTime.getFullYear();
const nowMonth = nowTime.getMonth();
const nowDate = nowTime.getDate();

/**
 * 日期控件
 */
export default class Calendar extends PureComponent {
    static propTypes = {
        timestamp: PropTypes.number.isRequired,
        onSelect: PropTypes.func.isRequired,
    };

    state = {
        // 选中
        sYear: 0,
        sMonth: 0,
        sDate: 0,
        // 年份
        year: 0,
        // 月份（从0开始算）
        month: 0,
        // 日（多少号）
        date: 0,
        // 星期几
        day: 0,
        // 当月一共有多少天
        totalDay: 0,
        // 日期分布
        timeArray: [],
        begin: 0,
        end: 0,
    };

    componentDidMount() {
        // 常规属性
        const {timestamp} = this.props;
        const time = new Date(timestamp);
        const year = time.getFullYear();
        const month = time.getMonth();
        const date = time.getDate();
        const day = time.getDay();
        const totalDay = new Date(year, month + 1, 0).getDate();

        this.setState({
            sYear: year, sMonth: month, sDate: date, year, month, date, day, totalDay,
        }, () => {
            this.updateDateArray();
        });
    }

    updateDateArray() {
        const {year, month, totalDay} = this.state;
        const preYear = month === MONTH.Feb ? year - 1 : year;
        const preMonth = month - 1 < MONTH.Feb ? MONTH.Dec : month - 1;
        const preMonthTotalDay = new Date(year, month, 0).getDate();
        const startDay = new Date(year, month, 1).getDay();
        const nextYear = month + 1 > MONTH.Dec ? year + 1 : year;
        const nextMonth = month + 1 >= MONTH.Dec ? MONTH.Feb : month + 1;

        let timeArray = [];
        let begin = startDay;
        let end = startDay + totalDay;
        // 上月的日期
        for (let i = startDay; i > 0; i--) {
            let preDay = preMonthTotalDay - i + 1;
            timeArray.push(getDay(preYear, preMonth, preDay));
        }
        // 这个月的日期
        for (let i = 1; i <= totalDay; i++) {
            timeArray.push(getDay(year, month, i));
        }
        // 下个月的日期
        let leftDate = 42 - timeArray.length;
        for (let i = 1; i <= leftDate; i++) {
            timeArray.push(getDay(nextYear, nextMonth, i));
        }

        this.setState({
            timeArray, begin, end
        })
    }

    handleSelectTime(time) {
        const {onSelect} = this.props;
        const {year, month, date} = time;
        onSelect(new Date(year, month, date).getTime());
    }

    preMonth = ()=>  {
        let {year, month} = this.state;
        if (month < MONTH.Feb) {
            month = MONTH.Dec;
            year = year - 1;
        } else {
            month = month - 1;
        }
        this.setState({
            year, month
        }, () => {
            this.updateDateArray();
        })
    };

    nextMonth = () => {
        let {year, month} = this.state;
        if (month > MONTH.Dec) {
            month = MONTH.Feb;
            year = year + 1;
        } else {
            month = month + 1;
        }
        this.setState({
            year, month
        }, () => {
            this.updateDateArray();
        })
    };

    renderTool() {
        const {year, month} = this.state;
        let realMonth = month < MONTH.Oct ? '0' + (month + 1) : month + 1;
        return (
            <div className="tools">
                <span className="btn pre waves" onClick={this.preMonth}>&lt;</span>
                <span className="detail">{year + ' 年 ' + realMonth + ' 月 '}</span>
                <span className="btn next waves" onClick={this.nextMonth}>></span>
            </div>
        )
    }

    renderWeek() {
        return weekArray.map(function (eachWeek) {
            return <span className="week" key={eachWeek}>{eachWeek}</span>
        })
    }

    renderDay() {
        const {sYear, sMonth, sDate, timeArray, begin, end} = this.state;
        return timeArray.map((eachTime, index) => {
            const {year, month, date} = eachTime;
            let notCurrMonth = index < begin || index >= end;
            let isNow = nowYear === year && nowMonth === month && nowDate === date;
            let isSelect = sYear === year && sMonth === month && sDate === date;
            return (
                <span
                    className={cs("day", {"not-curr": notCurrMonth, "now": isNow, 'is-select': isSelect})}
                    key={index}
                    onClick={() => {
                        this.handleSelectTime(eachTime)
                    }}>{date}</span>
            );
        })
    }

    render() {
        return (
            <div className="calendar">
                {this.renderTool()}
                {this.renderWeek()}
                {this.renderDay()}
            </div>
        )
    }
}