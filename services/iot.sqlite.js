const path = require('path');
const sqlite3 = require('sqlite3').verbose();

function getSensors() {
    return new Promise(function (resolve, reject) {
        let sensors = [];
        const db = new sqlite3.Database(path.join(__dirname, '..', 'sample.sqlite'));
        db.serialize(() => {
            db.each('SELECT id, name, description, group_name, object_id, location_x, location_y, location_z FROM sensors', (err, row) => {
                if (err) {
                    reject(err);
                }
                const { id, name, description, group_name, object_id, location_x, location_y, location_z } = row;
                sensors.push({
                    id,
                    name,
                    description,
                    groupName: group_name,
                    objectId: object_id,
                    location: {
                        x: location_x,
                        y: location_y,
                        z: location_z
                    }
                });
            });
        });
        db.close(() => {
            resolve(sensors);
        });
    });
}

function getChannels() {
    return new Promise(function (resolve, reject) {
        let channels = [];
        const db = new sqlite3.Database(path.join(__dirname, '..', 'sample.sqlite'));
        db.serialize(() => {
            db.each('SELECT id, name, description, unit, min, max FROM channels', (err, row) => {
                if (err) {
                    reject(err);
                }
                channels.push({
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    unit: row.unit,
                    min: row.min,
                    max: row.max
                });
            });
        });
        db.close(() => {
            resolve(channels);
        });
    });
}

function getSamples(start, end) {
    return new Promise(function (resolve, reject) {
        const data = {};
        const timestamps = [];
        const db = new sqlite3.Database(path.join(__dirname, '..', 'sample.sqlite'));
        db.serialize(() => {
            db.each(`SELECT sensor_id, channel_id, timestamp, value FROM samples WHERE timestamp >= ${start.getTime()} AND timestamp <= ${end.getTime()} ORDER BY timestamp`, (err, row) => {
                if (err) {
                    reject(err);
                }
                const { sensor_id, channel_id, timestamp, value } = row;
                if (timestamps.length === 0 || timestamps[timestamps.length - 1] !== timestamp) {
                    timestamps.push(timestamp);
                }
                data[sensor_id] ||= {};
                data[sensor_id][channel_id] ||= [];
                data[sensor_id][channel_id].push(value);
            });
        });
        db.close(() => {
            resolve({ count: timestamps.length, timestamps: timestamps.map(t => new Date(t)), data });
        });
    });
}

module.exports = {
    getSensors,
    getChannels,
    getSamples
};
