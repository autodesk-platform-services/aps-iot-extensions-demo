/// import * as Autodesk from "@types/forge-viewer";

class HeatmapsExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this.panel = null;
        this._surfaceShadingData = null;
        this.getSensorValue = (surfaceShadingPoint, sensorType) => {
            const sensors = this.dataView.getSensors();
            const sensor = sensors.get(surfaceShadingPoint.id);
            const historicalData = this.dataView.getHistoricalData();
            const sensorData = historicalData.get(surfaceShadingPoint.id);
            const channel = sensor.model.channels.get(sensorType);
            const channelData = sensorData.values.get(sensorType);
            const fractionalIndex = this.findNearestTimestampIndex(sensorData.timestamps, this.currentTime, true);
            const index1 = Math.floor(fractionalIndex);
            const index2 = Math.ceil(fractionalIndex);
            if (index1 !== index2) {
                const value = channelData[index1] + (channelData[index2] - channelData[index1]) * (fractionalIndex - index1);
                return (value - channel.min) / (channel.max - channel.min);
            } else {
                const value = channelData[index1];
                return (value - channel.min) / (channel.max - channel.min);
            }
        };
        this.onChannelChanged = null;
        this.updateHeatmaps = this.updateHeatmaps.bind(this);
        this.updateChannels = this.updateChannels.bind(this);
        this.onSensorsChanged = this.onSensorsChanged.bind(this);
    }

    onDataViewChanged(oldDataView, newDataView) {
        if (oldDataView) {
            oldDataView.removeEventListener(DataViewEvents.HISTORICAL_DATA_CHANGED, this.updateHeatmaps);
            oldDataView.removeEventListener(DataViewEvents.SENSORS_CHANGED, this.onSensorsChanged);
        }
        if (newDataView) {
            newDataView.addEventListener(DataViewEvents.HISTORICAL_DATA_CHANGED, this.updateHeatmaps);
            newDataView.addEventListener(DataViewEvents.SENSORS_CHANGED, this.onSensorsChanged);
        }
    }

    onCurrentTimeChanged(oldTime, newTime) {
        this.updateHeatmaps();
    }

    onCurrentChannelChanged(oldChannelID, newChannelID) {
        this.updateHeatmaps();
    }

    async onSensorsChanged() {
        if (this.isActive()) {
            const channelID = this.currentChannelID || this.getDefaultChannelID();
            await this._setupSurfaceShading(this.viewer.model);
            this._dataVizExt.renderSurfaceShading('iot-heatmap', channelID, this.getSensorValue);
        }
    }

    async updateHeatmaps() {
        if (this.isActive()) {
            const channelID = this.currentChannelID || this.getDefaultChannelID();
            if (!this._surfaceShadingData) {
                await this._setupSurfaceShading(this.viewer.model);
                this._dataVizExt.renderSurfaceShading('iot-heatmap', channelID, this.getSensorValue);
            } else {
                this._dataVizExt.updateSurfaceShading(this.getSensorValue);
            }
        }
    }

    updateChannels() {
        // We assume all active sensors share the same model
        const sensors = Array.from(this.dataView.getSensors().values());
        if (sensors.length === 0) {
            return;
        }
        this.panel.updateChannels(sensors[0].model.channels);
    }

    async load() {
        await super.load();
        this.panel = new HeatmapsPanel(this.viewer, 'heatmaps', 'Heatmaps');
        this.panel.onChannelChanged = (channelId) => {
            if (this.onChannelChanged) {
                this.onChannelChanged(channelId);
            }
        };
        console.log('IoT.Heatmaps extension loaded.');
        return true;
    }

    async unload() {
        super.unload();
        this.panel.uninitialize();
        this.panel = null;
        console.log('IoT.Heatmaps extension unloaded.');
        return true;
    }

    activate() {
        super.activate();
        this.panel.setVisible(true);
        this.updateChannels();
    }

    deactivate() {
        super.deactivate();
        this.panel.setVisible(false);
    }

    onToolbarCreated() {
        this._createToolbarUI('iot-heatmaps-btn', 'IoT Heatmaps', 'https://img.icons8.com/ios-filled/50/000000/heat-map.png'); // <a href="https://icons8.com/icon/8315/heat-map">Heat Map icon by Icons8</a>
    }

    async _setupSurfaceShading(model) {
        const sensors = this.dataView.getSensors();
        if (!sensors) {
            return;
        }
        const shadingGroup = new Autodesk.DataVisualization.Core.SurfaceShadingGroup('iot-heatmap');
        const rooms = new Map();
        for (const [sensorId, sensor] of sensors.entries()) {
            if (!rooms.has(sensor.surfaceDbId)) {
                const room = new Autodesk.DataVisualization.Core.SurfaceShadingNode(sensorId, sensor.surfaceDbId);
                shadingGroup.addChild(room);
                rooms.set(sensor.surfaceDbId, room);
            }
            const room = rooms.get(sensor.surfaceDbId);
            const types = Array.from(sensor.model.channels.keys());
            room.addPoint(new Autodesk.DataVisualization.Core.SurfaceShadingPoint(sensorId, sensor.location, types));
        }
        this._surfaceShadingData = new Autodesk.DataVisualization.Core.SurfaceShadingData();
        this._surfaceShadingData.addChild(shadingGroup);
        this._surfaceShadingData.initialize(model);
        await this._dataVizExt.setupSurfaceShading(model, this._surfaceShadingData);
        // this._dataVizExt.registerSurfaceShadingColors('temp', [0x00ff00, 0xffff00, 0xff0000]);
    }
}

class HeatmapsPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(viewer, id, title, options) {
        super(viewer.container, id, title, options);
        this.viewer = viewer;
        this.container.style.left = (options?.x || 0) + 'px';
        this.container.style.top = (options?.y || 0) + 'px';
        this.container.style.width = '300px';
        this.container.style.height = '150px';
        this.container.style.resize = 'none';
        this.onChannelChanged = null;
    }

    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);
        this.content = document.createElement('div');
        this.content.style.height = '100px';
        this.content.style.backgroundColor = '#333';
        this.content.style.color = '#eee';
        this.content.style.opacity = 0.9;
        this.content.innerHTML = `
            <div style="height: 50px; padding: 1em; box-sizing: border-box;">
                <label>Channel</label>
                <select id="iot-heatmap-channel">
                </select>
            </div>
            <div style="height: 50px">
                <canvas id="iot-heatmap-legend" width="300" height="50"></canvas>
            </div>
        `;
        this.container.appendChild(this.content);
        this.dropdown = document.getElementById('iot-heatmap-channel');
        this.canvas = document.getElementById('iot-heatmap-legend');
    }

    updateChannels(channels) {
        this.dropdown.innerHTML = '';
        for (const [channelId, channel] of channels.entries()) {
            const option = document.createElement('option');
            option.value = channelId;
            option.innerText = channel.name;
            this.dropdown.appendChild(option);
        }
        this.dropdown.onchange = () => {
            const channel = channels.get(this.dropdown.value);
            const labels = [
                `${channel.min.toFixed(2)}${channel.unit}`,
                `${((channel.max + channel.min) / 2).toFixed(2)}${channel.unit}`,
                `${channel.max.toFixed(2)}${channel.unit}`
            ];
            const colorStops = ['blue', 'green', 'yellow', 'red']; // Default color stops of the DataViz heatmap extension
            this.updateLegend(labels, colorStops);
            if (this.onChannelChanged) {
                this.onChannelChanged(this.dropdown.value);
            }
        };
        this.dropdown.onchange();
    }

    updateLegend(labels, colorStops) {
        /** @type {CanvasRenderingContext2D} */ const context = this.canvas.getContext('2d');
        let i, len;

        context.clearRect(0, 0, 300, 50);

        context.fillStyle = 'white';
        for (i = 0, len = labels.length; i < len; i++) {
            let x = 10 + 280 * i / (len - 1);
            if (i === len - 1) {
                x -= context.measureText(labels[i]).width;
            } else if (i > 0) {
                x -= 0.5 * context.measureText(labels[i]).width;
            }
            context.fillText(labels[i], x, 10);
        }

        const gradient = context.createLinearGradient(0, 0, 300, 0);
        for (i = 0, len = colorStops.length; i < len; i++) {
            gradient.addColorStop(i / (len - 1), colorStops[i]);
        }
        context.fillStyle = gradient;
        context.fillRect(10, 20, 280, 20);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('IoT.Heatmaps', HeatmapsExtension);
