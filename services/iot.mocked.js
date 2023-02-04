async function getSamples(sensors, timerange, resolution = 32) {
    const data = {};
    for (const sensor of sensors) {
        data[sensor.code] = {
            'temp': generateRandomValues(18.0, 28.0, resolution, 1.0),
            'co2': generateRandomValues(540.0, 600.0, resolution, 5.0)
        };
    }
    return {
        count: resolution,
        timestamps: generateTimestamps(timerange.start, timerange.end, resolution),
        data
    };
}

function generateTimestamps(start, end, count) {
    const delta = Math.floor((end.getTime() - start.getTime()) / (count - 1));
    const timestamps = [];
    for (let i = 0; i < count; i++) {
        timestamps.push(new Date(start.getTime() + i * delta));
    }
    return timestamps;
}

function generateRandomValues(min, max, count, maxDelta) {
    const values = [];
    let lastValue = min + Math.random() * (max - min);
    for (let i = 0; i < count; i++) {
        values.push(lastValue);
        lastValue += (Math.random() - 0.5) * 2.0 * maxDelta;
        if (lastValue > max) {
            lastValue = max;
        }
        if (lastValue < min) {
            lastValue = min;
        }
    }
    return values;
}

module.exports = {
    getSamples
};
