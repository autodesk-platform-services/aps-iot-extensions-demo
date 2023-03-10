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
        super.unload();
        this.panel?.uninitialize();
        this.panel = undefined;
        console.log(`${SensorListExtensionID} extension unloaded.`);
        return true;
    }

    activate() {
        super.activate();
        this.panel?.setVisible(true);
        return true;
    }

    deactivate() {
        super.deactivate();
        this.panel?.setVisible(false);
        return true;
    }

    onToolbarCreated() {
        this.createToolbarButton('iot-sensor-list-btn', 'IoT Sensor list', 'https://img.icons8.com/ios-filled/50/000000/reminders.png'); // <a href="https://icons8.com/icon/qTpBZcesrDao/reminders">Reminders icon by Icons8</a>
    }
}