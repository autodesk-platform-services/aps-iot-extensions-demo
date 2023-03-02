const { InfluxDB } = require('@influxdata/influxdb-client');
const { INFLUXDB_URL, INFLUXDB_ORG, INFLUXDB_BUCKET, INFLUXDB_TOKEN } = require('../config.js');

const SENSORS = [
    {
        id: 'TLM0100',
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
    {
        id: 'TLM0101',
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
    {
        id: 'TLM0102',
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
    {
        id: 'TLM0103',
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
];

const CHANNELS = [
    {
        id: 'co',
        name: 'CO₂',
        description: 'Level of carbon dioxide.',
        type: 'double',
        unit: 'ppm',
        min: 0.0,
        max: 1.0
    },
    {
        id: 'humidity',
        name: 'Humidity',
        description: 'Air humidity.',
        type: 'double',
        unit: '%',
        min: 0.0,
        max: 100.0
    },
    {
        id: 'temperature',
        name: 'Temperature',
        description: 'Internal temperature.',
        type: 'double',
        unit: '°F',
        min: 50.0,
        max: 100.0
    }
];

const SENSOR_ID_COLUMN_NAME = 'sensor_id';
const CHANNEL_ID_COLUMN_NAME = '_field';
const TIMESTAMP_COLUMN_NAME = '_time';
const VALUE_COLUMN_NAME = '_value';

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
            |> filter(fn: (r) => ${SENSORS.map(sensor => `r["${SENSOR_ID_COLUMN_NAME}"] == "${sensor.id}"`).join(' or ')})
            |> filter(fn: (r) => ${CHANNELS.map(channel => `r["${CHANNEL_ID_COLUMN_NAME}"] == "${channel.id}"`).join(' or ')})
            |> aggregateWindow(every: ${resolution}, fn: mean, createEmpty: false)
            |> yield(name: "mean")
    `;
    return new Promise(function (resolve, reject) {
        let data = [];
        api.queryRows(query, {
            next: (row, table) => {
                row = table.toObject(row);
                data.push([
                    row[TIMESTAMP_COLUMN_NAME],
                    SENSORS.findIndex(sensor => sensor.id === row[SENSOR_ID_COLUMN_NAME]),
                    CHANNELS.findIndex(channel => channel.id === row[CHANNEL_ID_COLUMN_NAME]),
                    row[VALUE_COLUMN_NAME]
                ]);
            },
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