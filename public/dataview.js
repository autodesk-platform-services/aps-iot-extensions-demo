export class MyDataView {
    constructor() {
        this._timerange = [new Date(), new Date()];
        this._sensors = new Map();
        this._channels = new Map();
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
        this._sensors = new Map(Object.entries(await this._fetch('/iot/sensors')));
    }

    async _loadChannels() {
        this._channels = new Map(Object.entries(await this._fetch('/iot/channels')));
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

    getSensors() { return this._sensors; }

    getChannels() { return this._channels; }

    getTimerange() { return this._timerange; }

    getSamples(sensorId, channelId) {
        if (!this._data) {
            return null;
        }
        const samples = this._data.filter(e => e.sensor_id === sensorId && e._field === channelId);
        return {
            count: samples.length,
            timestamps: samples.map(e => new Date(e._time)),
            values: samples.map(e => e._value)
        }
    }
}