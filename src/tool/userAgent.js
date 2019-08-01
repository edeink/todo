const agent = window.navigator.userAgent.toLowerCase();

const lowIE11 = agent.indexOf("compatible") > -1 && agent.indexOf("msie") > -1;
const isIEPure = lowIE11 || (agent.indexOf('trident') > -1 && agent.indexOf("rv:11.0") > -1);
const isEdge = agent.indexOf("edge") > -1 && !lowIE11;
const isIE = isIEPure || isEdge;
const isFirefox = agent.indexOf('firefox') !== -1;
const isSafari = agent.indexOf('chrome') === -1 && agent.indexOf('safari') !== -1;
const isSougou = agent.indexOf('se 2.x') > -1;
const isIosChrome = agent.indexOf('crios') !== -1;
const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|iPad/i.test(agent);
const isMobileIos = /iPhone|iPod/i.test(agent);
const isAndroid = /Android/i.test(agent);
const isIos = /iPhone|iPod|iPad/i.test(agent);
const isInWeChat = /MicroMessenger/i.test(agent);
const isWindows = agent.indexOf('window') !== -1;
const isMacOs = agent.indexOf('mac') !== -1;
const isLinux = agent.indexOf('linux') !== -1;
const isIphone = agent.indexOf('iphone') !== -1;
const isWindowsFirefox = isWindows && isFirefox;

module.exports = {
    agent,
    isIE,
    isIEPure,
    isEdge,
    isFirefox,
    isSougou,
    isMobile,
    isMobileIos,
    isAndroid,
    isWindows,
    isMacOs,
    isLinux,
    isIphone,
    isWindowsFirefox,
    isInWeChat,
    isIos,
    isSafari,
    isIosChrome,
};
