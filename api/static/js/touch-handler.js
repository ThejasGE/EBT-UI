function touchHandler(event) {
    var touch = event.changedTouches[0];

    var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent({
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup"
    }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);

    touch.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function init(element) {
    element.addEventListener("touchstart", touchHandler, {passive: true});
    element.addEventListener("touchmove", touchHandler, {passive: true});
    element.addEventListener("touchend", touchHandler, {passive: true});
    element.addEventListener("touchcancel", touchHandler, {passive: true});
}