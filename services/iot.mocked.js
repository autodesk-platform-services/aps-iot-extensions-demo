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
        surfaceDbId: 4111
    },
    'sensor-2': {
        model_id: 'hmc-1',
        name: 'Kitchen',
        desc: 'Basic sensor in the middle of the kitchen.',
        location: {
            x: 3.21,
            y: 41.64,
            z: -12.15
        },
        surfaceDbId: 4124
    }
};

async function getSensors() {
    return {
        models: MODELS,
        sensors: SENSORS
    };
}

async function getSensorData(timerange) {
    return {
        'sensor-1': {
            count: 32,
            timestamps: generateTimestamps(timerange.start, timerange.end, 32),
            values: {
                'temp': generateRandomValues(20.0, 24.0, 32),
                'co2': generateRandomValues(540.0, 600.0, 32)
            }
        },
        'sensor-2': {
            count: 32,
            timestamps: generateTimestamps(timerange.start, timerange.end, 32),
            values: {
                'temp': generateRandomValues(20.0, 24.0, 32),
                'co2': generateRandomValues(540.0, 600.0, 32)
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

function generateRandomValues(min, max, count) {
    const values = [];
    for (let i = 0; i < count; i++) {
        values.push(min + Math.random() * (max - min));
    }
    return values;
}

module.exports = {
    getSensors,
    getSensorData
};
