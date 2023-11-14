export class MyDataView extends EventTarget {
    constructor() {
        super();
        this._timestamps = [];
        this._sensors = new Map();
        this._channels = new Map();
        this._data = new Map();
        this._floor = null;
        this._sensorsFilteredByFloor = null;

        // Add random realtime data once every 5 seconds (only keeping the last 12 samples)
        setInterval(() => {
            // Push new timestamp
            if (this._timestamps.length >= 12) {
                this._timestamps.shift();
            }
            this._timestamps.push(new Date());
            // Push new data sample to each sensor/channel
            for (const sensorId of this._sensors.keys()) {
                for (const [channelId, channel] of this._channels.entries()) {
                    const key = `${sensorId}/${channelId}`;
                    const arr = this._data.get(key);
                    if (!arr) {
                        const value = channel.min + Math.random() * (channel.max - channel.min);
                        this._data.set(key, [value])
                    } else {
                        if (arr.length >= 12) {
                            arr.shift();
                        }
                        const value = arr[arr.length - 1] + 0.1 * (Math.random() - 0.5) * (channel.max - channel.min);
                        arr.push(Math.max(channel.min, Math.min(channel.max, value)));
                    }
                }
            }
            this.dispatchEvent(new CustomEvent('update'));
        }, 5000);
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

    async init() {
        try {
            await Promise.all([
                this._loadSensors(),
                this._loadChannels()
            ]);
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

    getTimerange() {
        return this._timestamps.length > 0
            ? [this._timestamps[0], this._timestamps[this._timestamps.length - 1]]
            : [new Date(), new Date()];
    }

    getSamples(sensorId, channelId) {
        const key = `${sensorId}/${channelId}`;
        if (!this._data.has(key)) {
            return null;
        } else {
            return {
                count: this._timestamps.length,
                timestamps: this._timestamps,
                values: this._data.get(key)
            }
        }
    }
}
