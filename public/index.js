import { initViewer, loadModel } from './viewer.js';
import { initTimeline } from './timeline.js';
import { MyDataView } from './dataview.js';

const FORGE_MODEL_URN = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6cGV0cmJyb3otc2FtcGxlcy9yYWNfYmFzaWNfc2FtcGxlX3Byb2plY3RfMjAyMC5ydnQ';
const FORGE_MODEL_VIEW = 'e4baebbb-4ad6-8223-7f6a-cad4f0bb353a';

async function init() {
    const dataView = new MyDataView();

    async function onTimeRangeUpdated(ev) {
        dataView.setTimerange(new Date(ev.start), new Date(ev.end));
    }
    async function onCurrentTimeUpdated(ev) {
        dataView.setCurrentTime(new Date(ev.time));
    }

    await initTimeline(document.getElementById('timeline'), onTimeRangeUpdated, onCurrentTimeUpdated);
    const viewer = await initViewer(document.getElementById('preview'), ['Autodesk.AEC.LevelsExtension', 'IoT.SensorList', 'IoT.SensorDetail', 'IoT.Sprites', 'IoT.Heatmaps']);
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
        levelsExt.dataView = dataView;
        levelsExt.levelsPanel.setVisible(true);
        adjustPanelStyle(levelsExt.levelsPanel, { left: '10px', top: '10px', width: '300px', height: '300px' });

        const sensorListExt = viewer.getExtension('IoT.SensorList');
        sensorListExt.dataView = dataView;
        sensorListExt.activate();
        adjustPanelStyle(sensorListExt.panel, { right: '10px', top: '10px', width: '500px', height: '300px' });

        const sensorDetailExt = viewer.getExtension('IoT.SensorDetail');
        sensorDetailExt.dataView = dataView;
        sensorDetailExt.activate();
        adjustPanelStyle(sensorDetailExt.panel, { right: '10px', top: '320px', width: '500px', height: '300px' });

        const heatmapsExt = viewer.getExtension('IoT.Heatmaps');
        heatmapsExt.dataView = dataView;
        heatmapsExt.activate();
        adjustPanelStyle(heatmapsExt.panel, { left: '10px', top: '320px', width: '300px', height: '150px' });

        const spritesExt = viewer.getExtension('IoT.Sprites');
        spritesExt.dataView = dataView;
        spritesExt.activate();

        onTimeRangeUpdated({ start: new Date('2022-01-01'), end: new Date('2022-01-30') });
        spritesExt.onSensorClicked = (sensorId) => {
            dataView.setCurrentSensorID(sensorId);
        };
        heatmapsExt.onChannelChanged = (channelId) => {
            dataView.setCurrentChannelID(channelId);
        };
    });
    loadModel(viewer, FORGE_MODEL_URN, FORGE_MODEL_VIEW);
}

init();
