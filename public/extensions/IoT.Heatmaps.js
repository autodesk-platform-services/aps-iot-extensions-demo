/// import * as Autodesk from "@types/forge-viewer";

class HeatmapsExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this.panel = null;
        this._surfaceShadingData = null;
        this._getSensorValue = (surfaceShadingPoint, sensorType) => {
            const sensor = this._sensors.get(surfaceShadingPoint.id);
            const sensorData = this._historicalData.get(surfaceShadingPoint.id);
            const channel = sensor.model.channels.get(sensorType);
            const channelData = sensorData.values.get(sensorType);
            const closestIndex = this._findNearestTimestampIndex(sensorData.timestamps, this._currentTimestamp);
            const value = channelData[closestIndex];
            return (value - channel.min) / (channel.max - channel.min);
        };
        this.onChannelChanged = null;
    }

    async onDataChange({ sensors, historicalData, currentSensorID, currentChannelID, currentTimestamp }) {
        // TODO: only update what needs to be updated
        if (this.isActive() && this._sensors && this._historicalData) {
            if (!this._surfaceShadingData) {
                await this._setupSurfaceShading(this.viewer.model);
                this._dataVizExt.renderSurfaceShading('iot-heatmap', this._currentChannelID, this._getSensorValue);
            } else {
                if (currentChannelID) {
                    this._dataVizExt.renderSurfaceShading('iot-heatmap', this._currentChannelID, this._getSensorValue);
                }
                this._dataVizExt.updateSurfaceShading(this._getSensorValue);
            }
        }
        if (sensors) {
            // For now we assume all available sensors use the same model!
            const sensors = Array.from(this._sensors.values());
            const model = sensors[0].model;
            this.panel.updateChannels(model.channels);
        }
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
    }

    deactivate() {
        super.deactivate();
        this.panel.setVisible(false);
    }

    onToolbarCreated() {
        this._createToolbarUI('iot-heatmaps-btn', 'IoT Heatmaps', 'https://img.icons8.com/ios-filled/50/000000/heat-map.png'); // <a href="https://icons8.com/icon/8315/heat-map">Heat Map icon by Icons8</a>
    }

    async _setupSurfaceShading(model) {
        if (!this._sensors) {
            return;
        }
        const shadingGroup = new Autodesk.DataVisualization.Core.SurfaceShadingGroup('iot-heatmap');
        for (const [sensorId, sensor] of this._sensors.entries()) {
            const room = new Autodesk.DataVisualization.Core.SurfaceShadingNode(sensorId, sensor.surfaceDbId);
            const types = Array.from(sensor.model.channels.keys());
            room.addPoint(new Autodesk.DataVisualization.Core.SurfaceShadingPoint(sensorId, sensor.location, types));
            shadingGroup.addChild(room);
        }
        this._surfaceShadingData = new Autodesk.DataVisualization.Core.SurfaceShadingData();
        this._surfaceShadingData.addChild(shadingGroup);
        this._surfaceShadingData.initialize(model);
        await this._dataVizExt.setupSurfaceShading(model, this._surfaceShadingData);
        // this._dataVizExt.registerSurfaceShadingColors('temp', [0x00ff00, 0xffff00, 0xff0000]);
        // this._dataVizExt.registerSurfaceShadingColors('co2', [0x00ff00, 0xffff00, 0xff0000]);
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
