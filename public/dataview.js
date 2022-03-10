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
    constructor() {
        super();
        this._timerange = { start: new Date(), end: new Date() };
        this._sensors = new Map();
        this._historicalData = new Map();
        this._currentTime = this._timerange.start;
        this._currentSensorID = null;
        this._currentChannelID = null;
        loadSensors()
            .then(sensors => {
                this._sensors = sensors;
                this.triggerEvent(DataViewEvents.SENSORS_CHANGED, {});
                this.setTimerange(new Date('2022-01-01'), new Date('2022-01-30'));
            })
            .catch(err => {
                console.error(err);
                this.triggerEvent(DataViewEvents.ERROR, err);
            });
    }

    setTimerange(start, end) {
        this._timerange.start = start;
        this._timerange.end = end;
        if (this._currentTime < this._timerange.start) {
            this._currentTime = this._timerange.start;
        } else if (this._currentTime > this._timerange.end) {
            this._currentTime = this._timerange.end;
        }
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

    setCurrentTime(time) {
        this._currentTime = time;
        this.triggerEvent(DataViewEvents.CURRENT_TIME_CHANGED, {});
    }

    setCurrentSensorID(sensorId) {
        this._currentSensorID = sensorId;
        this.triggerEvent(DataViewEvents.CURRENT_SENSOR_CHANGED, {});
    }

    setCurrentChannelID(channelId) {
        this._currentChannelID = channelId;
        this.triggerEvent(DataViewEvents.CURRENT_CHANNEL_CHANGED, {});
    }

    getTimerange() {
        return this._timerange;
    }

    getSensors() {
        return this._sensors;
    }

    getHistoricalData() {
        return this._historicalData;
    }

    getCurrentTime() {
        return this._currentTime;
    }

    getCurrentSensorID() {
        if (this._currentSensorID) {
            return this._currentSensorID;
        } else if (this._sensors && this._sensors.size > 0) {
            return this._sensors.keys().next().value;
        } else {
            return null;
        }
    }

    getCurrentChannelID() {
        if (this._currentChannelID) {
            return this._currentChannelID;
        } else if (this._sensors && this._sensors.size > 0) {
            const sensor = this._sensors.values().next().value;
            return sensor.model.channels.keys().next().value;
        } else {
            return null;
        }
    }

    findNearestTimestampIndex(list, timestamp) {
        let start = 0;
        let end = list.length - 1;
        if (timestamp <= list[0]) {
            return 0;
        }
        if (timestamp >= list[end]) {
            return end;
        }
        while (end - start > 1) {
            let currentIndex = start + Math.floor(0.5 * (end - start));
            if (timestamp < list[currentIndex]) {
                end = currentIndex;
            } else {
                start = currentIndex;
            }
        }
        return (timestamp - list[start] < list[end] - timestamp) ? start : end;
    }
}
