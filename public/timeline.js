function debounce(func, timeout = 500) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

export function initTimeline(container, onTimeRangeChanged, onTimeMarkerChanged) {
    return new Promise(function (resolve, reject) {
        let timeslider = new ChronosEtu.TimeSlider(container.clientWidth, container.clientHeight, '2022-01-01', '2022-02-01');
        window.addEventListener('resize', () => {
            const { clientWidth, clientHeight } = container;
            timeslider.resize(clientWidth, clientHeight);
        });
        timeslider.on('appready', () => {
            timeslider.off('appready');
            container.appendChild(timeslider.view());
            resolve(timeslider);
        });
        timeslider.on('tscreated', debounce((ev) => onTimeRangeChanged(new Date(ev.start), new Date(ev.end))));
        timeslider.on('tsmodifying', debounce((ev) => onTimeRangeChanged(new Date(ev.start), new Date(ev.end))));
        timeslider.on('tsmodified', debounce((ev) => onTimeRangeChanged(new Date(ev.start), new Date(ev.end))));
        timeslider.on('timemarkerchanged', debounce((ev) => onTimeMarkerChanged(new Date(ev.time))));
        timeslider.on('playbackmarkerchanged', (ev) => onTimeMarkerChanged(new Date(ev.time)));
        // timeslider.on('tsdeleted', (ev) => { console.log('tsdeleted'); });
        // timeslider.on('tsmodifystart', (ev) => { console.log('tsmodifystart'); });
        // timeslider.on('play', (ev) => { console.log('play'); });
        // timeslider.on('pause', (ev) => { console.log('pause'); });
        // timeslider.on('stop', (ev) => { console.log('stop'); });
    });
}
