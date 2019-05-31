
const eventHelper = {
    TYPE: {
        TIP: 'tip',
    },
    stop(event) {
        event.stopPropagation();
        event.preventDefault();
    },
    dispatch(type, detail={}, bubbles = true, cancellable = true) {
        const event = document.createEvent('CustomEvent');
        event.initCustomEvent(type, bubbles, cancellable, detail);
        window.dispatchEvent(event);
    }
}

export default eventHelper;