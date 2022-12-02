/// import * as Autodesk from "@types/forge-viewer";
import { UIBaseExtension } from './BaseExtension.js';
import { SensorDetailPanel } from './SensorDetailPanel.js';
export const SensorDetailExtensionID = 'IoT.SensorDetail';
export class SensorDetailExtension extends UIBaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
    }
    onDataViewChanged(oldDataView, newDataView) { this.updateCharts(); }
    onCurrentTimeChanged(oldTime, newTime) { this.updateCursor(); }
    onCurrentSensorChanged(oldSensorID, newSensorID) { this.updateCharts(); }
    updateCharts() {
        if (this.dataView && this.currentSensorID && this.panel) {
            const sensor = this.dataView.getSensors().get(this.currentSensorID);
            if (sensor) {
                this.panel.setTitle(sensor ? `Sensor: ${sensor.name}` : 'Sensor Details', {});
                this.panel.updateCharts(this.currentSensorID, this.dataView);
                this.updateCursor();
            }
        }
    }
    updateCursor() {
        if (this.dataView && this.panel && this.currentSensorID && this.currentTime) {
            const sensor = this.dataView.getSensors().get(this.currentSensorID);
            if (sensor) {
                this.panel.updateCursor(this.currentSensorID, this.dataView, this.currentTime);
            }
        }
    }
    async load() {
        await super.load();
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.5.1/chart.min.js', 'Chart');
        this.panel = new SensorDetailPanel(this.viewer, 'iot-sensor-detail', 'Sensor Details');
        console.log(`${SensorDetailExtensionID} extension loaded.`);
        return true;
    }
    unload() {
        var _a;
        super.unload();
        (_a = this.panel) === null || _a === void 0 ? void 0 : _a.uninitialize();
        this.panel = undefined;
        console.log(`${SensorDetailExtensionID} extension unloaded.`);
        return true;
    }
    activate() {
        var _a;
        super.activate();
        (_a = this.panel) === null || _a === void 0 ? void 0 : _a.setVisible(true);
        return true;
    }
    deactivate() {
        var _a;
        super.deactivate();
        (_a = this.panel) === null || _a === void 0 ? void 0 : _a.setVisible(false);
        return true;
    }
    onToolbarCreated() {
        this.createToolbarButton('iot-sensor-detail-btn', 'IoT Sensor Detail', 'https://img.icons8.com/ios-filled/50/000000/show-property.png'); // <a href="https://icons8.com/icon/10255/show-property">Show Property icon by Icons8</a>
    }
}
