// This mocked up IoT data is setup for the rac_basic_sample_project.rvt sample design.

const MODELS = {
    'hmc-1': {
        name: 'Human Comfort Sensor',
        desc: 'Monitors indoor air quality by measuring levels of Carbon Dioxide (CO2), temperature, and humidity.',
        channels: {
            'temp': {
                name: 'Temperature',
                desc: 'External temperature in degrees Celsius.',
                type: 'double',
                unit: '°C',
                min: 18.0,
                max: 28.0
            },
            'co2': {
                id: 'co2',
                name: 'CO₂',
                desc: 'Level of carbon dioxide.',
                type: 'double',
                unit: 'ppm',
                min: 482.81,
                max: 640.00
            }
        }
    }
};

const SENSORS = {
    'sensor-1': {
        model_id: 'hmc-1',
        name: 'Living Room',
        desc: 'Basic sensor in the middle of the living room.',
        location: {
            x: 31.92,
            y: 11.49,
            z: -12.97
        },
        surfaceDbId: 4124
    },
    'sensor-2': {
        model_id: 'hmc-1',
        name: 'Dining Table',
        desc: 'Basic sensor at the dining table.',
        location: {
            x: -10,
            y: 41.64,
            z: -12.15
        },
        surfaceDbId: 4111
    },
    'sensor-3': {
        model_id: 'hmc-1',
        name: 'Kitchen',
        desc: 'Basic sensor in the kitchen.',
        location: {
            x: 10,
            y: 41.64,
            z: -12.15
        },
        surfaceDbId: 4111
    },
    'sensor-4': {
        model_id: 'hmc-1',
        name: 'Bedroom',
        desc: 'Basic sensor in the bedroom.',
        location: {
            x: -7.46,
            y: 41.47,
            z: 2.97
        },
        surfaceDbId: 4085
    }
};

async function getSensors() {
    return {
        models: MODELS,
        sensors: SENSORS
    };
}

async function getSensorData(timerange, resolution = 32) {
    return {
        'sensor-1': {
            count: resolution,
            timestamps: generateTimestamps(timerange.start, timerange.end, resolution),
            values: {
                'temp': generateRandomValues(18.0, 28.0, resolution, 1.0),
                'co2': generateRandomValues(540.0, 600.0, resolution, 5.0)
            }
        },
        'sensor-2': {
            count: resolution,
            timestamps: generateTimestamps(timerange.start, timerange.end, resolution),
            values: {
                'temp': generateRandomValues(20.0, 24.0, resolution, 1.0),
                'co2': generateRandomValues(540.0, 600.0, resolution, 5.0)
            }
        },
        'sensor-3': {
            count: resolution,
            timestamps: generateTimestamps(timerange.start, timerange.end, resolution),
            values: {
                'temp': generateRandomValues(24.0, 28.0, resolution, 1.0),
                'co2': generateRandomValues(500.0, 620.0, resolution, 5.0)
            }
        },
        'sensor-4': {
            count: resolution,
            timestamps: generateTimestamps(timerange.start, timerange.end, resolution),
            values: {
                'temp': generateRandomValues(20.0, 24.0, resolution, 1.0),
                'co2': generateRandomValues(600.0, 640.0, resolution, 5.0)
            }
        }
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
    getSensorData
};
