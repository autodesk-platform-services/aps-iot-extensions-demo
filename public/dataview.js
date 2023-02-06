export class MyDataView {
    constructor() {
        this._timerange = [new Date(), new Date()];
        this._timestamps = [];
        this._sensors = new Map();
        this._channels = new Map();
        this._data = null;
        this._floor = null;
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

    async _post(url, data) {
        const resp = await fetch(url, {
            method: 'post',
            body: JSON.stringify(data),
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const json = await resp.json();
        return json;
    }

    async _delete(url) {
        const resp = await fetch(url, {
            method: 'delete'
        });

        if (!resp.ok) {
            throw new Error(await resp.text());
        }
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
        this._timerange[0] = start;
        this._timerange[1] = end;
        const { timestamps, data } = await this._fetch(`/iot/samples?start=${start.toISOString()}&end=${end.toISOString()}&resolution=${resolution}`)
        this._timestamps = timestamps.map(str => new Date(str));
        this._data = data;
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

    getSensors() {
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

    getChannels() { return this._channels; }

    getTimerange() { return this._timerange; }

    getSamples(sensorId, channelId) {
        if (!this._data[sensorId] || !this._data[sensorId][channelId]) {
            return null;
        }
        return {
            count: this._timestamps.length,
            timestamps: this._timestamps,
            values: this._data[sensorId][channelId]
        }
    }
}
