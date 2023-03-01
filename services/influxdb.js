const { InfluxDB } = require('@influxdata/influxdb-client');
const { INFLUXDB_URL, INFLUXDB_ORG, INFLUXDB_BUCKET, INFLUXDB_TOKEN } = require('../config.js');

const SENSORS = {
    'TLM0100': {
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
    'TLM0101': {
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
    'TLM0102': {
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
    'TLM0103': {
        code: 'TLM0103',
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
    'co': {
        name: 'CO₂',
        description: 'Level of carbon dioxide.',
        type: 'double',
        unit: 'ppm',
        min: 0.0,
        max: 1.0
    },
    'humidity': {
        name: 'Humidity',
        description: 'Air humidity.',
        type: 'double',
        unit: '%',
        min: 0.0,
        max: 100.0
    },
    'temperature': {
        name: 'Temperature',
        description: 'Internal temperature.',
        type: 'double',
        unit: '°F',
        min: 50.0,
        max: 100.0
    }
};

function getSensors() {
    return SENSORS;
}

function getChannels() {
    return CHANNELS;
}

function getSamples(start, end) {
    const client = new InfluxDB({ url: INFLUXDB_URL, token: INFLUXDB_TOKEN });
    const api = client.getQueryApi(INFLUXDB_ORG);
    const resolution = '5m'; // See https://docs.influxdata.com/flux/v0.x/stdlib/universe/duration/
    const query = `
        from(bucket: "${INFLUXDB_BUCKET}")
            |> range(start: ${start.toISOString()}, stop: ${end.toISOString()})
            |> filter(fn: (r) => ${Object.keys(SENSORS).map(e => `r["sensor_id"] == "${e}"`).join(' or ')})
            |> filter(fn: (r) => ${Object.keys(CHANNELS).map(e => `r["_field"] == "${e}"`).join(' or ')})
            |> aggregateWindow(every: ${resolution}, fn: mean, createEmpty: false)
            |> yield(name: "mean")
    `;
    return new Promise(function (resolve, reject) {
        let data = [];
        api.queryRows(query, {
            next: (row, table) => data.push(table.toObject(row)),
            error: err => reject(err),
            complete: () => resolve(data)
        });
    });
}

module.exports = {
    getSensors,
    getChannels,
    getSamples
};