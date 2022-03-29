export class MyDataView {
    constructor() {
        this._floor = null;
        this._sensors = new Map();
        this._channels = new Map();
        this._data = null;
        this._sensorsFilteredByFloor = null;
    }

    async _fetch(url) {
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const json = await resp.json();
        return json;
    }

    async _loadSensors() {
        this._sensors.clear();
        const json = await this._fetch('/iot/sensors');
        for (const [sensorId, sensor] of Object.entries(json)) {
            this._sensors.set(sensorId, sensor);
        }
        this._sensorsFilteredByFloor = null;
    }

    async _loadChannels() {
        this._channels.clear();
        const json = await this._fetch('/iot/channels');
        for (const [channelId, channel] of Object.entries(json)) {
            this._channels.set(channelId, channel);
        }
    }

    async _loadSamples(timerange, resolution) {
        const { start, end } = timerange;
        const json = await this._fetch(`/iot/data?start=${start.toISOString()}&end=${end.toISOString()}&resolution=${resolution}`)
        for (const [_, data] of Object.entries(json)) {
            data.timestamps = data.timestamps.map(str => new Date(str));
        }
        this._data = json;
    }

    async init(timerange, resolution = 32) {
        try {
            await Promise.all([
                this._loadSensors(),
                this._loadChannels(),
                this._loadSamples(timerange, resolution)
            ]);
        } catch (err) {
            console.error(err);
        }
    }

    async refresh(timerange, resolution = 32) {
        try {
            await this._loadSamples(timerange, resolution);
        } catch (err) {
            console.error(err);
        }
    }

    get floor() {
        return this._floor;
    }

    set floor(floor) {
        this._floor = floor;
        this._sensorsFilteredByFloor = null;
    }

    get sensors() {
        if (!this._sensorsFilteredByFloor) {
            this._sensorsFilteredByFloor = new Map();
            for (const [sensorId, sensor] of this._sensors.entries()) {
                if (!this._floor || (sensor.location.z >= this._floor.zMin && sensor.location.z <= this._floor.zMax)) {
                    this._sensorsFilteredByFloor.set(sensorId, sensor);
                }
            }
        }
        return this._sensorsFilteredByFloor;
    }

    get channels() {
        return this._channels;
    }

    getSamples(sensorId, channelId) {
        const sensorData = this._data[sensorId];
        if (!sensorData) {
            return null;
        }
        const channelData = sensorData.values[channelId];
        if (!channelData) {
            return null;
        }
        return {
            count: sensorData.count,
            timestamps: sensorData.timestamps,
            values: channelData
        }
    }
}
