/**
 * IoT sensor model ID.
 * @typedef {string} ModelID
 */

/**
 * IoT sensor channel ID.
 * @typedef {string} ChannelID
 */

/**
 * IoT sensor ID.
 * @typedef {string} SensorID
 */

/**
 * IoT sensor model definition.
 * @typedef {object} Model
 * @property {string} name - Sensor model display name.
 * @property {string} desc - Sensor model description.
 * @property {Map<ChannelID, Channel>} channels - Map of channels the sensor can provide measurements for, indexed by channel ID.
 */

/**
 * IoT sensor channel definition.
 * @typedef {object} Channel
 * @property {string} name - Channel display name.
 * @property {string} desc - Channel description.
 * @property {string} type - Channel data type.
 * @property {string} unit - Channel data unit.
 * @property {number} min - Channel minimum data value.
 * @property {number} max - Channel maximum data value.
 */

/**
 * IoT sensor description.
 * @typedef {object} Sensor
 * @property {Model} model - Sensor model.
 * @property {string} name - Sensor display name.
 * @property {string} desc - Sensor description.
 * @property {object} location - Sensor location.
 * @property {number} location.x - Sensor location X coordinate.
 * @property {number} location.y - Sensor location Y coordinate.
 * @property {number} location.z - Sensor location Z coordinate.
 * @property {number} [surfaceDbId] - Optional ID of surface to be shaded with heatmaps.
 */

/** Collection of historical data of single sensors.
 * @typedef {object} HistoricalData
 * @property {number} count - Number of data samples available in different channels.
 * @property {Date[]} timestamps - Timestamps of data samples in different channels.
 * @property {Map<ChannelID, number[]>} values - Sensor channel values, indexed by channel ID.
 */

const DataViewEvents = {
    SENSORS_CHANGED: 'sensors-changed',
    HISTORICAL_DATA_CHANGED: 'historical-data-changed',
    ERROR: 'error'
};

class DataView {
    constructor() {
        this._listeners = new Map();
    }

    addEventListener(type, listener) {
        if (!this._listeners.has(type)) {
            this._listeners.set(type, new Set());
        }
        this._listeners.get(type).add(listener);
    }

    removeEventListener(type, listener) {
        if (this._listeners.has(type)) {
            this._listeners.get(type).delete(listener);
        }
    }

    triggerEvent(type, data) {
        if (this._listeners.has(type)) {
            const listeners = this._listeners.get(type);
            for (const listener of listeners.values()) {
                listener.call(this, data);
            }
        }
    }

    /**
     * @returns {Map<SensorID, Sensor>} All visible sensors, indexed by sensor ID.
     */
    getSensors() {
        throw new Error('Not implemented');
    }

    /**
     * @returns {Map<SensorID, HistoricalData>} Historical sensor data, indexed by sensor ID.
     */
    getHistoricalData() {
        throw new Error('Not implemented');
    }
}

class BaseExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._dataView = null;
        this._currentTime = new Date();
        this._currentSensorID = null;
        this._currentChannelID = null;
        this._dataVizExt = null;
        this._group = null;
        this._button = null;
        this._panel = null;
    }

    get dataView() {
        return this._dataView;
    }

    set dataView(newDataView) {
        const oldDataView = this._dataView;
        this._dataView = newDataView;
        this.onDataViewChanged(oldDataView, newDataView);
    }

    onDataViewChanged(oldDataView, newDataView) {}

    get currentTime() {
        return this._currentTime;
    }

    set currentTime(newTime) {
        const oldTime = this._currentTime;
        this._currentTime = newTime;
        this.onCurrentTimeChanged(oldTime, newTime);
    }

    onCurrentTimeChanged(oldTime, newTime) {}

    get currentSensorID() {
        return this._currentSensorID;
    }

    set currentSensorID(newSensorID) {
        const oldSensorID = this._currentSensorID;
        this._currentSensorID = newSensorID;
        this.onCurrentSensorChanged(oldSensorID, newSensorID);
    }

    onCurrentSensorChanged(oldSensorID, newSensorID) {}

    get currentChannelID() {
        return this._currentChannelID;
    }

    set currentChannelID(newChannelID) {
        const oldChannelID = this._currentChannelID;
        this._currentChannelID = newChannelID;
        this.onCurrentChannelIDChanged(oldChannelID, newChannelID);
    }

    onCurrentChannelChanged(oldChannelID, newChannelID) {}

    async load() {
        this._dataVizExt = await this.viewer.loadExtension('Autodesk.DataVisualization');
        return true;
    }

    unload() {
        this._dataVizExt = null;
        this._removeToolbarUI();
        return true;
    }

    activate() {
        this._button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);
        this.activeStatus = true;
    }

    deactivate() {
        this._button.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
        this.activeStatus = false;
    }

    _createToolbarUI(buttonId, buttonTooltip, buttonIconUrl) {
        this._group = this.viewer.toolbar.getControl('iot-toolbar');
        if (!this._group) {
            this._group = new Autodesk.Viewing.UI.ControlGroup('iot-toolbar');
            this.viewer.toolbar.addControl(this._group);
        }
        this._button = new Autodesk.Viewing.UI.Button(buttonId);
        this._button.onClick = (ev) => {
            this.setActive(!this.isActive());
        };
        const icon = this._button.container.querySelector('.adsk-button-icon');
        if (icon) {
            icon.style.backgroundImage = `url(${buttonIconUrl})`; 
            icon.style.backgroundSize = `24px`; 
            icon.style.backgroundRepeat = `no-repeat`; 
            icon.style.backgroundPosition = `center`; 
            icon.style.filter = 'invert(1)';
        }
        this._button.setToolTip(buttonTooltip);
        this._group.addControl(this._button);
    }

    _removeToolbarUI() {
        if (this._group) {
            this._group.removeControl(this._button);
            if (this._group.getNumberOfControls() === 0) {
                this.viewer.toolbar.removeControl(this._group);
            }
            this._button = null;
            this._group = null;
        }
    }

    findNearestTimestampIndex(list, timestamp, includeFraction) {
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

        if (includeFraction && start < end) {
            return start + (timestamp - list[start]) / (list[end] - list[start]);
        } else {
            return (timestamp - list[start] < list[end] - timestamp) ? start : end;
        }
    }

    getDefaultSensorID() {
        const sensorIDs = Array.from(this.dataView.getSensors().keys());
        return sensorIDs[0];
    }

    getDefaultChannelID() {
        const defaultSensorID = this.getDefaultSensorID();
        const defaultSensor = this.dataView.getSensors().get(defaultSensorID);
        const channelIds = Array.from(defaultSensor.model.channels.keys());
        return channelIds[0];
    }
}
