/// import * as Autodesk from "@types/forge-viewer";
import { UIBaseExtension } from './BaseExtension.js';
import { SensorListPanel } from './SensorListPanel.js';
export const SensorListExtensionID = 'IoT.SensorList';
export class SensorListExtension extends UIBaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
    }
    onDataViewChanged(oldDataView, newDataView) { this.update(true); }
    onCurrentTimeChanged(oldTime, newTime) { this.update(false); }
    update(updateColumns) {
        if (this.dataView && this.currentTime && this.panel) {
            this.panel.update(this.dataView, this.currentTime, updateColumns);
        }
    }
    async load() {
        await super.load();
        await Promise.all([
            this.loadScript('https://unpkg.com/tabulator-tables@5.1.7/dist/js/tabulator.min.js', 'Tabulator'),
            this.loadStylesheet('https://unpkg.com/tabulator-tables@5.1.7/dist/css/tabulator_midnight.min.css')
        ]);
        this.panel = new SensorListPanel(this.viewer, 'iot-sensor-list', 'Sensors', {});
        this.panel.onSensorClicked = (sensorId) => {
            if (this.onSensorClicked) {
                this.onSensorClicked(sensorId);
            }
        };
        console.log(`${SensorListExtensionID} extension loaded.`);
        return true;
    }
    unload() {
        var _a;
        super.unload();
        (_a = this.panel) === null || _a === void 0 ? void 0 : _a.uninitialize();
        this.panel = undefined;
        console.log(`${SensorListExtensionID} extension unloaded.`);
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
        this.createToolbarButton('iot-sensor-list-btn', 'IoT Sensor list', 'https://img.icons8.com/ios-filled/50/000000/reminders.png'); // <a href="https://icons8.com/icon/qTpBZcesrDao/reminders">Reminders icon by Icons8</a>
    }
}
