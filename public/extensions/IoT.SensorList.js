/// import * as Autodesk from "@types/forge-viewer";

class SensorListExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this.panel = null;
    }

    onDataChange({ sensors, historicalData, currentSensorID, currentChannelID, currentTimestamp }) {
        // TODO: only update what needs to be updated
        this.panel.update(this._sensors, this._historicalData, this._currentTimestamp);
    }

    async load() {
        await super.load();
        this.panel = new SensorListPanel(this.viewer, 'sensor-list', 'Sensor List');
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
        this.setProperties([
            { displayCategory: 'Floor 1', displayName: 'Sensor 1.1', displayValue: 'Temp: 25°C, Hum: 45%, CO2: 1.22' },
            { displayCategory: 'Floor 1', displayName: 'Sensor 1.2', displayValue: 'Temp: 27°C, Hum: 42%, CO2: 1.13' },
            { displayCategory: 'Floor 2', displayName: 'Sensor 2.1', displayValue: 'Temp: 24°C, Hum: 46%, CO2: 1.08' },
            { displayCategory: 'Floor 3', displayName: 'Sensor 3.1', displayValue: 'Temp: 26°C, Hum: 44%, CO2: 1.89' }
        ]);
    }

    /**
     * 
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
                const closestIndex = this._findNearestTimestampIndex(sensorData.timestamps, timestamp);
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
