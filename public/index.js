import { initViewer, loadModel } from './viewer.js';
import { initTimeline } from './timeline.js';
import { MyDataView } from './dataview.js';

const FORGE_MODEL_URN = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6cGV0cmJyb3otc2FtcGxlcy9yYWNfYmFzaWNfc2FtcGxlX3Byb2plY3RfMjAyMC5ydnQ';
const FORGE_MODEL_VIEW = 'e4baebbb-4ad6-8223-7f6a-cad4f0bb353a';
const FORGE_MODEL_DEFAULT_FLOOR_INDEX = 2;
const DEFAULT_TIMERANGE_START = new Date('2022-01-01');
const DEFAULT_TIMERANGE_END = new Date('2022-01-30');

const IOT_EXTENSION_IDS = ['IoT.SensorList', 'IoT.SensorDetail', 'IoT.Sprites', 'IoT.Heatmaps'];
const IOT_PANEL_STYLES = {
    'IoT.SensorList': { right: '10px', top: '10px', width: '500px', height: '300px' },
    'IoT.SensorDetail': { right: '10px', top: '320px', width: '500px', height: '300px' },
    'IoT.Heatmaps': { left: '10px', top: '320px', width: '300px', height: '150px' }
};

function adjustPanelStyle(panel, { left, right, top, bottom, width, height }) {
    const style = panel.container.style;
    style.setProperty('left', left ? left : 'unset');
    style.setProperty('right', right ? right : 'unset');
    style.setProperty('top', top ? top : 'unset');
    style.setProperty('bottom', bottom ? bottom : 'unset');
    style.setProperty('width', width ? width : 'unset');
    style.setProperty('height', height ? height : 'unset');
}

async function init() {
    /** @type {DataView} */ const dataView = new MyDataView({ start: DEFAULT_TIMERANGE_START, end: DEFAULT_TIMERANGE_END });
    /** @type {BaseExtension[]} */ const extensions = [];

    function onTimeRangeChanged(start, end) {
        dataView.setTimerange({ start, end });
    }
    function onTimeMarkerChanged(time) {
        extensions.forEach(ext => ext.currentTime = time);
    }
    function onCurrentSensorChanged(sensorId) {
        extensions.forEach(ext => ext.currentSensorID = sensorId);
    }
    function onCurrentChannelChanged(channelId) {
        extensions.forEach(ext => ext.currentChannelId = channelId);
    }
    function onLevelChanged({ target, levelIndex }) {
        dataView.setFloor(levelIndex !== undefined ? target.floorData[levelIndex] : null);
    }

    await initTimeline(document.getElementById('timeline'), onTimeRangeChanged, onTimeMarkerChanged);
    const viewer = await initViewer(document.getElementById('preview'), IOT_EXTENSION_IDS.concat(['Autodesk.AEC.LevelsExtension']));
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, async function () {
        // Setup and auto-activate IoT extensions
        for (const extensionID of IOT_EXTENSION_IDS) {
            const extension = viewer.getExtension(extensionID);
            extensions.push(extension);
            extension.dataView = dataView;
            extension.activate();
            if (IOT_PANEL_STYLES[extensionID]) {
                adjustPanelStyle(extension.panel, IOT_PANEL_STYLES[extensionID]);
            }
        }

        // Setup and auto-activate other viewer extensions
        const levelsExt = viewer.getExtension('Autodesk.AEC.LevelsExtension');
        levelsExt.levelsPanel.setVisible(true);
        levelsExt.floorSelector.addEventListener(Autodesk.AEC.FloorSelector.SELECTED_FLOOR_CHANGED, onLevelChanged);
        levelsExt.floorSelector.selectFloor(FORGE_MODEL_DEFAULT_FLOOR_INDEX, true);
        adjustPanelStyle(levelsExt.levelsPanel, { left: '10px', top: '10px', width: '300px', height: '300px' });

        onTimeRangeChanged(DEFAULT_TIMERANGE_START, DEFAULT_TIMERANGE_END);
        viewer.getExtension('IoT.Sprites').onSensorClicked = (sensorId) => onCurrentSensorChanged(sensorId);
        viewer.getExtension('IoT.Heatmaps').onChannelChanged = (channelId) => onCurrentChannelChanged(channelId);
    });
    loadModel(viewer, FORGE_MODEL_URN, FORGE_MODEL_VIEW);
}

init();
