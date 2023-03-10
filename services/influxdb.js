const { InfluxDB } = require('@influxdata/influxdb-client');
const { INFLUXDB_URL, INFLUXDB_ORG, INFLUXDB_BUCKET, INFLUXDB_TOKEN } = require('../config.js');

const SENSORS = require('../sample-data/sensors.json');
const CHANNELS = require('../sample-data/channels.json');

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