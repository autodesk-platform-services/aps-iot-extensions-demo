export class MyDataView {
    constructor() {
        this._timerange = [new Date(), new Date()];
        this._sensors = [];
        this._sensorsMap = new Map();
        this._channels = [];
        this._channelsMap = new Map();
        this._data = [];
    }

    async _fetch(url) {
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(await resp.text());
        } else {
            const json = await resp.json();
            return json;
        }
    }

    async _loadSensors() {
        this._sensors = await this._fetch('/iot/sensors');
        this._sensorsMap = new Map();
        for (const sensor of this._sensors) {
            this._sensorsMap.set(sensor.id, sensor);
        }
    }

    async _loadChannels() {
        this._channels = await this._fetch('/iot/channels');
        this._channelsMap = new Map();
        for (const channel of this._channels) {
            this._channelsMap.set(channel.id, channel);
        }
    }

    async _loadData(start, end) {
        this._data = await this._fetch(`/iot/samples?start=${start.toISOString()}&end=${end.toISOString()}`);
    }

    async init(timerange) {
        try {
            this._timerange = timerange;
            await Promise.all([
                this._loadSensors(),
                this._loadChannels(),
                this._loadData(this._timerange[0], this._timerange[1])
            ]);
        } catch (err) {
            alert('Could not retrieve IoT data. See console for additional details.');
            console.error(err);
        }
    }

    async refresh(timerange) {
        try {
            this._timerange = timerange;
            await this._loadData(this._timerange[0], this._timerange[1]);
        } catch (err) {
            alert('Could not retrieve IoT data. See console for additional details.');
            console.error(err);
        }
    }

    getSensors() { return this._sensorsMap; }

    getChannels() { return this._channelsMap; }

    getTimerange() { return this._timerange; }

    getSamples(sensorId, channelId) {
        if (!this._data) {
            return null;
        }
        const sensorPos = this._sensors.findIndex(sensor => sensor.id === sensorId);
        const channelPos = this._channels.findIndex(channel => channel.id === channelId);
        const rows = this._data.filter(row => row[1] === sensorPos && row[2] === channelPos);
        return {
            count: rows.length,
            timestamps: rows.map(row => new Date(row[0])),
            values: rows.map(row => row[3])
        }
    }
}