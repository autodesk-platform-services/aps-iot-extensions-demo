// This mocked up IoT data is setup for the rac_basic_sample_project.rvt sample design.

const SENSORS = {
    'sensor-1': {
        name: 'Living Room',
        description: 'Basic sensor in the middle of the living room.',
        groupName: 'Level 1',
        location: {
            x: 31.92,
            y: 11.49,
            z: -12.97
        },
        objectId: 4124
    },
    'sensor-2': {
        name: 'Dining Table',
        description: 'Basic sensor at the dining table.',
        groupName: 'Level 1',
        location: {
            x: -10,
            y: 41.64,
            z: -12.15
        },
        objectId: 4111
    },
    'sensor-3': {
        name: 'Kitchen',
        description: 'Basic sensor in the kitchen.',
        groupName: 'Level 1',
        location: {
            x: 10,
            y: 41.64,
            z: -12.15
        },
        objectId: 4111
    },
    'sensor-4': {
        name: 'Bedroom',
        description: 'Basic sensor in the bedroom.',
        groupName: 'Level 2',
        location: {
            x: -7.46,
            y: 41.47,
            z: 2.97
        },
        objectId: 4085
    }
};

const CHANNELS = {
    'temp': {
        name: 'Temperature',
        description: 'External temperature in degrees Celsius.',
        type: 'double',
        unit: '°C',
        min: 18.0,
        max: 28.0
    },
    'co2': {
        name: 'CO₂',
        description: 'Level of carbon dioxide.',
        type: 'double',
        unit: 'ppm',
        min: 482.81,
        max: 640.00
    }
};

async function getSensors() {
    return SENSORS;
}

async function getChannels() {
    return CHANNELS;
}

async function getSamples(sensors, timerange, resolution = 32) {
    const data = {};
    sensors.forEach(sensor => {
        const values = {};
        values['temp'] = generateRandomValues(18.0, 28.0, resolution, 1.0);
        values['co2'] = generateRandomValues(540.0, 600.0, resolution, 5.0);
        data[sensor.code] = values;
    });

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
    getSensors,
    getChannels,
    getSamples
};
