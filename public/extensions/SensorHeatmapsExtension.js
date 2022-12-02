/// import * as Autodesk from "@types/forge-viewer";
import { UIBaseExtension } from './BaseExtension.js';
import { findNearestTimestampIndex } from './HistoricalDataView.js';
import { SensorHeatmapsPanel } from './SensorHeatmapsPanel.js';
export const SensorHeatmapsExtensionID = 'IoT.SensorHeatmaps';
export class SensorHeatmapsExtension extends UIBaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this.panel = undefined;
        this._surfaceShadingData = undefined;
        this.onChannelChanged = undefined;
        this.getSensorValue = this.getSensorValue.bind(this);
    }
    onDataViewChanged(oldDataView, newDataView) {
        this.updateChannels();
        this.createHeatmaps();
    }
    onCurrentTimeChanged(oldTime, newTime) { this.updateHeatmaps(); }
    onCurrentChannelChanged(oldChannelID, newChannelID) { this.updateHeatmaps(); }
    getSensorValue(surfaceShadingPoint, sensorType) {
        if (!this.dataView || !this.currentTime || !this.currentChannelID) {
            return 0.0;
        }
        const sensor = this.dataView.getSensors().get(surfaceShadingPoint.id);
        if (!sensor) {
            return 0.0;
        }
        const channel = this.dataView.getChannels().get(this.currentChannelID);
        if (!channel) {
            return 0.0;
        }
        const samples = this.dataView.getSamples(surfaceShadingPoint.id, this.currentChannelID);
        if (!samples) {
            return 0.0;
        }
        const fractionalIndex = findNearestTimestampIndex(samples.timestamps, this.currentTime, true);
        const index1 = Math.floor(fractionalIndex);
        const index2 = Math.ceil(fractionalIndex);
        if (index1 !== index2) {
            const value = samples.values[index1] + (samples.values[index2] - samples.values[index1]) * (fractionalIndex - index1);
            return (value - channel.min) / (channel.max - channel.min);
        }
        else {
            const value = samples.values[index1];
            return (value - channel.min) / (channel.max - channel.min);
        }
    }
    async createHeatmaps() {
        if (this.isActive()) { // TODO: update @types/forge-viewer
            const channelID = this.currentChannelID;
            await this._setupSurfaceShading(this.viewer.model);
            this._dataVizExt.renderSurfaceShading('iot-heatmap', channelID, this.getSensorValue);
        }
    }
    async updateHeatmaps() {
        if (this.isActive()) { // TODO: update @types/forge-viewer
            const channelID = this.currentChannelID;
            if (!this._surfaceShadingData) {
                await this._setupSurfaceShading(this.viewer.model);
                this._dataVizExt.renderSurfaceShading('iot-heatmap', channelID, this.getSensorValue);
            }
            else {
                this._dataVizExt.updateSurfaceShading(this.getSensorValue);
            }
        }
    }
    updateChannels() {
        if (this.dataView && this.panel) {
            this.panel.updateChannels(this.dataView);
        }
    }
    async load() {
        await super.load();
        this.panel = new SensorHeatmapsPanel(this.viewer, 'heatmaps', 'Heatmaps', {});
        this.panel.onChannelChanged = (channelId) => {
            if (this.onChannelChanged) {
                this.onChannelChanged(channelId);
            }
        };
        console.log(`${SensorHeatmapsExtensionID} extension loaded.`);
        return true;
    }
    unload() {
        var _a;
        super.unload();
        (_a = this.panel) === null || _a === void 0 ? void 0 : _a.uninitialize();
        this.panel = undefined;
        console.log(`${SensorHeatmapsExtensionID} extension unloaded.`);
        return true;
    }
    activate() {
        var _a;
        super.activate();
        (_a = this.panel) === null || _a === void 0 ? void 0 : _a.setVisible(true);
        this.onDataViewChanged(undefined, undefined);
        return true;
    }
    deactivate() {
        var _a;
        super.deactivate();
        (_a = this.panel) === null || _a === void 0 ? void 0 : _a.setVisible(false);
        this._dataVizExt.removeSurfaceShading();
        return true;
    }
    onToolbarCreated() {
        this.createToolbarButton('iot-heatmaps-btn', 'IoT Heatmaps', 'https://img.icons8.com/ios-filled/50/000000/heat-map.png'); // <a href="https://icons8.com/icon/8315/heat-map">Heat Map icon by Icons8</a>
    }
    async _setupSurfaceShading(model) {
        if (!this.dataView) {
            return;
        }
        const shadingGroup = new Autodesk.DataVisualization.Core.SurfaceShadingGroup('iot-heatmap');
        const rooms = new Map();
        for (const [sensorId, sensor] of this.dataView.getSensors().entries()) {
            if (!sensor.objectId) {
                continue;
            }
            if (!rooms.has(sensor.objectId)) {
                const room = new Autodesk.DataVisualization.Core.SurfaceShadingNode(sensorId, sensor.objectId);
                shadingGroup.addChild(room);
                rooms.set(sensor.objectId, room);
            }
            const room = rooms.get(sensor.objectId);
            const types = Array.from(this.dataView.getChannels().keys());
            room.addPoint(new Autodesk.DataVisualization.Core.SurfaceShadingPoint(sensorId, sensor.location, types));
        }
        this._surfaceShadingData = new Autodesk.DataVisualization.Core.SurfaceShadingData();
        this._surfaceShadingData.addChild(shadingGroup);
        this._surfaceShadingData.initialize(model);
        await this._dataVizExt.setupSurfaceShading(model, this._surfaceShadingData);
        // this._dataVizExt.registerSurfaceShadingColors('temp', [0x00ff00, 0xffff00, 0xff0000]);
    }
}
