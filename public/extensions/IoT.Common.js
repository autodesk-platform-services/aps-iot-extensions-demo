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

class BaseExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        /** @type {Map<SensorID, Sensor>} */ this._sensors = null;
        /** @type {Map<SensorID, HistoricalData>} */ this._historicalData = null;
        /** @type {SensorID} */ this._currentSensorID = null;
        /** @type {ChannelID} */ this._currentChannelID = null;
        /** @type {Date} */ this._currentTimestamp = null;
        this._dataVizExt = null;
        this._group = null;
        this._button = null;
        this._panel = null;
    }

    /**
     * @param {Map<SensorID, Sensor>} sensors Read-only map of sensors, indexed by sensor ID.
     */
    setSensors(sensors) {
        this._sensors = sensors;
        this.onDataChange({ sensors: true });
    }

    /**
     * @param {Map<SensorID, HistoricalData>} data Read-only map of historical sensor data, indexed by sensor ID.
     */
    setHistoricalData(data) {
        this._historicalData = data;
        this.onDataChange({ historicalData: true });
    }

    /**
     * @param {SensorID} sensorID Current sensor ID.
     */
    setCurrentSensor(sensorID) {
        this._currentSensorID = sensorID;
        this.onDataChange({ currentSensorID: true });
    }

    /**
     * @param {ChannelID} channelID Current channel ID.
     */
    setCurrentChannel(channelID) {
        this._currentChannelID = channelID;
        this.onDataChange({ currentChannelID: true });
    }

    /**
     * @param {Date} sensor Current timestamp.
     */
    setCurrentTimestamp(timestamp) {
        this._currentTimestamp = timestamp;
        this.onDataChange({ currentTimestamp: true });
    }

    onDataChange(flags) {
        throw new Error('Not implemented');
    }

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
}
