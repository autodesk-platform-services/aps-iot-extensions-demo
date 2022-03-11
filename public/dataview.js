async function loadSensors() {
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
    return sensors;
}

async function loadHistoricalData(timerange) {
    const resp = await fetch(`/iot/data?start=${timerange.start.toISOString()}&end=${timerange.end.toISOString()}`);
    if (!resp.ok) {
        throw new Error(await resp.text());
    }
    const json = await resp.json();
    const data = new Map(Object.entries(json));
    for (const sensorData of data.values()) {
        sensorData.timestamps = sensorData.timestamps.map(str => new Date(str));
        sensorData.values = new Map(Object.entries(sensorData.values));
    }
    return data;
}

export class MyDataView extends DataView {
    constructor(timerange) {
        super();
        this._timerange = timerange;
        this._floor = null;
        this._sensors = new Map();
        this._historicalData = new Map();
        loadSensors()
            .then(sensors => {
                this._sensors = sensors;
                this.triggerEvent(DataViewEvents.SENSORS_CHANGED, {});
                this.setTimerange(this._timerange);
            })
            .catch(err => {
                console.error(err);
                this.triggerEvent(DataViewEvents.ERROR, err);
            });
    }

    setTimerange(timerange) {
        this._timerange = timerange;
        loadHistoricalData(this._timerange)
            .then(data => {
                this._historicalData = data;
                this.triggerEvent(DataViewEvents.HISTORICAL_DATA_CHANGED, {});
            })
            .catch(err => {
                console.error(err);
                this.triggerEvent(DataViewEvents.ERROR, err);
            });
    }

    getTimerange() {
        return this._timerange;
    }

    setFloor(floor) {
        this._floor = floor;
        this.triggerEvent(DataViewEvents.SENSORS_CHANGED, {});
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
}
