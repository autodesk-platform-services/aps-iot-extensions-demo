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
        const historicalData = await loadHistoricalData({ start: new Date(ev.start), end: new Date(ev.end) });
        for (const ext of extensions) {
            ext.setHistoricalData(historicalData);
        }
    }
    async function onCurrentTimeUpdated(ev) {
        const currentTimestamp = new Date(ev.time);
        for (const ext of extensions) {
            ext.setCurrentTimestamp(currentTimestamp);
        }
    }
    async function onCurrentChannelUpdated(channelId) {
        for (const ext of extensions) {
            ext.setCurrentChannel(channelId);
        }
    }
    async function onSensorSelected(sensorId) {
        for (const ext of extensions) {
            ext.setCurrentSensor(sensorId);
        }
    }

    timeline = await initTimeline(document.getElementById('timeline'), onTimeRangeUpdated, onCurrentTimeUpdated);
    viewer = await initViewer(document.getElementById('preview'), ['Autodesk.AEC.LevelsExtension', 'IoT.SensorList', 'IoT.SensorDetail', 'IoT.Sprites', 'IoT.Heatmaps']);
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, async function () {
        function adjustPanelStyle(panel, { left, right, top, bottom, width, height }) {
            const style = panel.container.style;
            style.setProperty('left', left ? left : 'unset');
            style.setProperty('right', right ? right : 'unset');
            style.setProperty('top', top ? top : 'unset');
            style.setProperty('bottom', bottom ? bottom : 'unset');
            style.setProperty('width', width ? width : 'unset');
            style.setProperty('height', height ? height : 'unset');
        }

        const levelsExt = viewer.getExtension('Autodesk.AEC.LevelsExtension');
        levelsExt.levelsPanel.setVisible(true);
        adjustPanelStyle(levelsExt.levelsPanel, { left: '10px', top: '10px', width: '300px', height: '300px' });

        const sensorListExt = viewer.getExtension('IoT.SensorList');
        sensorListExt.activate();
        adjustPanelStyle(sensorListExt.panel, { right: '10px', top: '10px', width: '500px', height: '300px' });
        extensions.push(sensorListExt);

        const sensorDetailExt = viewer.getExtension('IoT.SensorDetail');
        sensorDetailExt.activate();
        adjustPanelStyle(sensorDetailExt.panel, { right: '10px', top: '320px', width: '500px', height: '300px' });
        extensions.push(sensorDetailExt);

        const heatmapsExt = viewer.getExtension('IoT.Heatmaps');
        heatmapsExt.activate();
        adjustPanelStyle(heatmapsExt.panel, { left: '10px', top: '320px', width: '300px', height: '150px' });
        extensions.push(heatmapsExt);

        const spritesExt = viewer.getExtension('IoT.Sprites');
        spritesExt.activate();
        extensions.push(spritesExt);

        onExtensionsLoaded();
        onTimeRangeUpdated({ start: new Date('2022-01-01'), end: new Date('2022-01-30') });
        onSensorSelected('sensor-1');
        spritesExt.onSensorClicked = (sensorId) => {
            onSensorSelected(sensorId);
        };
        heatmapsExt.onChannelChanged = (channelId) => {
            onCurrentChannelUpdated(channelId);
        };
    });
    loadModel(viewer, FORGE_MODEL_URN, FORGE_MODEL_VIEW);
}

init();
