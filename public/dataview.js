export class MyDataView extends DataView {
    constructor(timerange, resolution = 32) {
        super();
        this._timerange = timerange;
        this._resolution = resolution;
        this._floor = null;
        this._sensors = new Map();
        this._historicalData = new Map();
        this._loadSensors().then(() => this.setTimerange(this._timerange));
    }

    setTimerange(timerange) {
        this._timerange = timerange;
        this._loadHistoricalData();
    }

    getTimerange() {
        return this._timerange;
    }

    setFloor(floor) {
        this._floor = floor;
        this.dispatchEvent(new Event(DataViewEvents.SENSORS_CHANGED, {}));
    }

    getFloor() {
        return this._floor;
    }

    getSensors() {
        if (this._floor) {
            const { zMin, zMax } = this._floor;
            return this._sensors.filter(sensor => sensor.location.z >= zMin && sensor.location.z <= zMax);
        } else {
            return this._sensors;
        }
    }

    getHistoricalData() {
        return this._historicalData;
    }

    async _loadSensors() {
        try {
            const resp = await fetch('/iot/sensors');
            if (!resp.ok) {
                throw new Error(await resp.text());
            }
            const json = await resp.json();
            const models = new Map(Object.entries(json.models));
            for (const model of models.values()) {
                model.channels = new Map(Object.entries(model.channels));
            }
            const sensors = new Map(Object.entries(json.sensors));
            for (const sensor of sensors.values()) {
                sensor.model = models.get(sensor.model_id);
            }
            this._sensors = sensors;
            this.dispatchEvent(new Event(DataViewEvents.SENSORS_CHANGED, {}));
        } catch (err) {
            console.error(err);
            this.dispatchEvent(new Event(DataViewEvents.ERROR, { err }));
        }
    }

    async _loadHistoricalData() {
        try {
            const { start, end } = this._timerange;
            const resp = await fetch(`/iot/data?start=${start.toISOString()}&end=${end.toISOString()}&resolution=${this._resolution}`);
            if (!resp.ok) {
                throw new Error(await resp.text());
            }
            const json = await resp.json();
            const data = new Map(Object.entries(json));
            for (const sensorData of data.values()) {
                sensorData.timestamps = sensorData.timestamps.map(str => new Date(str));
                sensorData.values = new Map(Object.entries(sensorData.values));
            }
            this._historicalData = data;
            this.dispatchEvent(new Event(DataViewEvents.HISTORICAL_DATA_CHANGED, {}));
        } catch (err) {
            console.error(err);
            this.dispatchEvent(new Event(DataViewEvents.ERROR, { err }));
        }
    }
}
