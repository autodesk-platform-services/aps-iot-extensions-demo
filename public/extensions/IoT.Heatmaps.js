/// import * as Autodesk from "@types/forge-viewer";

class HeatmapsExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
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
    }

    async onDataChange({ sensors, historicalData, currentSensorID, currentChannelID, currentTimestamp }) {
        // TODO: only update what needs to be updated
        if (this.isActive() && this._sensors && this._historicalData) {
            if (!this._surfaceShadingData) {
                await this._setupSurfaceShading(this.viewer.model);
                this._dataVizExt.renderSurfaceShading('iot-heatmap', /*this._currentChannelID*/ 'temp', this._getSensorValue);
            } else {
                this._dataVizExt.updateSurfaceShading(this._getSensorValue);
            }
        }
    }

    async load() {
        await super.load();
        console.log('IoT.Heatmaps extension loaded.');
        return true;
    }

    async unload() {
        super.unload();
        console.log('IoT.Heatmaps extension unloaded.');
        return true;
    }

    activate() {
        super.activate();
    }

    deactivate() {
        super.deactivate();
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

        // this._dataVizExt.renderSurfaceShading('iot-heatmap', this._currentChannelID, this._getSensorValue);
        // this._dataVizExt.renderSurfaceShading('iot-heatmap', 'temperature', this._getSensorValue);
        // this._dataVizExt.updateSurfaceShading(this._getSensorValue);
        // this._dataVizExt.removeSurfaceShading(model);
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

Autodesk.Viewing.theExtensionManager.registerExtension('IoT.Heatmaps', HeatmapsExtension);
