import { initViewer, loadModel } from './viewer.js';
import { initTimeline } from './timeline.js';
import { loadSensors, loadHistoricalData } from './data.js';

const FORGE_MODEL_URN = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6cGV0cmJyb3otc2FtcGxlcy9yYWNfYmFzaWNfc2FtcGxlX3Byb2plY3RfMjAyMC5ydnQ';
const FORGE_MODEL_VIEW = 'e4baebbb-4ad6-8223-7f6a-cad4f0bb353a';

async function init() {
    let extensions = [], timeline, viewer;

    async function onExtensionsLoaded() {
        const sensors = await loadSensors();
        for (const ext of extensions) {
            ext.setSensors(sensors);
        }
    }
    async function onTimeRangeUpdated(ev) {
        console.log('Updating time range', ev.start, ev.end);
        const historicalData = await loadHistoricalData({ start: new Date(ev.start), end: new Date(ev.end) });
        for (const ext of extensions) {
            ext.setHistoricalData(historicalData);
        }
    }
    async function onCurrentTimeUpdated(ev) {
        console.log('Updating current time', ev.time);
        const currentTimestamp = new Date(ev.time);
        for (const ext of extensions) {
            ext.setCurrentTimestamp(currentTimestamp);
        }
    }
    async function onSensorSelected(sensorId) {
        console.log('Updating current sensor', sensorId);
        for (const ext of extensions) {
            ext.setCurrentSensor(sensorId);
        }
    }

    timeline = await initTimeline(document.getElementById('timeline'), onTimeRangeUpdated, onCurrentTimeUpdated);
    viewer = await initViewer(document.getElementById('preview'), ['Autodesk.AEC.LevelsExtension', 'IoT.SensorList', 'IoT.SensorDetail', 'IoT.Sprites', 'IoT.Heatmaps']);
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, async function () {
        const sensorListExt = viewer.getExtension('IoT.SensorList');
        sensorListExt.activate();
        extensions.push(sensorListExt);
        const sensorDetailExt = viewer.getExtension('IoT.SensorDetail');
        sensorDetailExt.activate();
        extensions.push(sensorDetailExt);
        const spritesExt = viewer.getExtension('IoT.Sprites');
        spritesExt.activate();
        extensions.push(spritesExt);
        const heatmapsExt = viewer.getExtension('IoT.Heatmaps');
        heatmapsExt.activate();
        extensions.push(heatmapsExt);
        onExtensionsLoaded();
        onTimeRangeUpdated({ start: new Date('2022-01-01'), end: new Date('2022-01-30') });
        onSensorSelected('sensor-1');
        spritesExt.onSensorClicked = (sensorId) => {
            onSensorSelected(sensorId);
        };
    });
    loadModel(viewer, FORGE_MODEL_URN, FORGE_MODEL_VIEW);
}

init();
