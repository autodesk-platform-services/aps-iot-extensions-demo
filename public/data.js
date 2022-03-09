export async function loadSensors() {
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

export async function loadHistoricalData(timerange) {
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
