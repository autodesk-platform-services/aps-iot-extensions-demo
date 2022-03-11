/// import * as Autodesk from "@types/forge-viewer";

class SensorListExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this.panel = null;
        this.update = this.update.bind(this);
    }

    onDataViewChanged(oldDataView, newDataView) {
        if (oldDataView) {
            oldDataView.removeEventListener(DataViewEvents.SENSORS_CHANGED, this.update);
            oldDataView.removeEventListener(DataViewEvents.HISTORICAL_DATA_CHANGED, this.update);
        }
        if (newDataView) {
            newDataView.addEventListener(DataViewEvents.SENSORS_CHANGED, this.update);
            newDataView.addEventListener(DataViewEvents.HISTORICAL_DATA_CHANGED, this.update);
        }
    }

    onCurrentTimeChanged(oldTime, newTime) {
        this.update();
    }

    update() {
        this.panel.update(this.dataView.getSensors(), this.dataView.getHistoricalData(), this.currentTime);
    }

    async load() {
        await super.load();
        this.panel = new SensorListPanel(this.viewer, 'iot-sensor-list', 'Sensors');
        console.log('IoT.SensorList extension loaded.');
        return true;
    }

    unload() {
        super.unload();
        this.panel.uninitialize();
        this.panel = null;
        console.log('IoT.SensorList extension unloaded.');
        return true;
    }

    activate() {
        super.activate();
        this.panel.setVisible(true);
    }

    deactivate() {
        super.deactivate();
        this.panel.setVisible(false);
    }

    onToolbarCreated() {
        this._createToolbarUI('iot-sensor-list-btn', 'IoT Sensor list', 'https://img.icons8.com/ios-filled/50/000000/reminders.png'); // <a href="https://icons8.com/icon/qTpBZcesrDao/reminders">Reminders icon by Icons8</a>
    }
}

class SensorListPanel extends Autodesk.Viewing.UI.PropertyPanel {
    constructor(viewer, id, title, options) {
        super(viewer.container, id, title, options);
        this.viewer = viewer;
    }

    /**
     * @param {Map<SensorID, Sensor>} sensors 
     * @param {Map<SensorID, HistoricalData>} data
     * @param {Date} timestamp 
     */
    update(sensors, data, timestamp) {
        // TODO: when possible, update existing props instead of re-creating them
        this.removeAllProperties();
        if (!sensors || !data) {
            return;
        }
        for (const [sensorId, sensor] of sensors.entries()) {
            const sensorData = data.get(sensorId);
            if (!sensorData) {
                continue;
            }
            for (const [channelId, channel] of sensor.model.channels.entries()) {
                const channelData = sensorData.values.get(channelId);
                if (!channelData) {
                    return;
                }
                const closestIndex = this._findNearestTimestampIndex(sensorData.timestamps, timestamp); // TODO: reuse this code from BaseExtension
                this.addProperty(channel.name, `${channelData[closestIndex].toFixed(2)} ${channel.unit}`, sensor.name);
            }
        }
    }

    _findNearestTimestampIndex(list, timestamp) {
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

Autodesk.Viewing.theExtensionManager.registerExtension('IoT.SensorList', SensorListExtension);
