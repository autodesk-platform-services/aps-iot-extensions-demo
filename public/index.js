import { initViewer, loadModel, adjustPanelStyle } from './viewer.js';
import { initTimeline } from './timeline.js';
import { MyDataView } from './dataview.js';
import { APS_MODEL_URN, APS_MODEL_VIEW, APS_MODEL_DEFAULT_FLOOR_INDEX, DEFAULT_TIMERANGE_START, DEFAULT_TIMERANGE_END } from './config.js';

import {
    SensorListExtensionID,
    SensorDetailExtensionID,
    SensorSpritesExtensionID,
    SensorHeatmapsExtensionID,
    SensorManagerExtensionID
} from './extensions/index.js';

const IOT_EXTENSION_IDS = [SensorListExtensionID, SensorDetailExtensionID, SensorSpritesExtensionID, SensorHeatmapsExtensionID];
const IOT_PANEL_STYLES = {
    [SensorListExtensionID]: { right: '10px', top: '10px', width: '500px', height: '300px' },
    [SensorDetailExtensionID]: { right: '10px', top: '320px', width: '500px', height: '300px' },
    [SensorSpritesExtensionID]: { left: '10px', top: '320px', width: '300px', height: '150px' }
};

let dataView = new MyDataView();
await dataView.init({ start: DEFAULT_TIMERANGE_START, end: DEFAULT_TIMERANGE_END });
let extensions = [];

async function onTimeRangeChanged(start, end) {
    await dataView.refresh({ start, end });
    extensions.forEach(ext => ext.dataView = dataView);
}
function onLevelChanged({ target, levelIndex }) {
    dataView.floor = levelIndex !== undefined ? target.floorData[levelIndex] : null;
    extensions.forEach(ext => ext.dataView = dataView);
}
function onTimeMarkerChanged(time) {
    extensions.forEach(ext => ext.currentTime = time);
}
function onCurrentSensorChanged(sensorId) {
    const sensor = dataView.getSensors().get(sensorId);
    if (sensor && sensor.objectId) {
        viewer.fitToView([sensor.objectId]);
    }
    extensions.forEach(ext => ext.currentSensorID = sensorId);
}
function onCurrentChannelChanged(channelId) {
    extensions.forEach(ext => ext.currentChannelID = channelId);
}

initTimeline(document.getElementById('timeline'), onTimeRangeChanged, onTimeMarkerChanged);
const viewer = await initViewer(document.getElementById('preview'), IOT_EXTENSION_IDS.concat([SensorManagerExtensionID, 'Autodesk.AEC.LevelsExtension']));
loadModel(viewer, APS_MODEL_URN, APS_MODEL_VIEW);
viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, async function () {
    // Configure extensions
    for (const extensionID of IOT_EXTENSION_IDS) {
        const extension = viewer.getExtension(extensionID);
        extensions.push(extension);
        extension.dataView = dataView;
        extension.activate();
        if (IOT_PANEL_STYLES[extensionID] && extension.panel) {
            adjustPanelStyle(extension.panel, IOT_PANEL_STYLES[extensionID]);
        }
    }

    // Setup sensor manager
    const sensorMgrExt = viewer.getExtension(SensorManagerExtensionID);
    sensorMgrExt.onSensorAdded = async (data) => {
        await dataView.addSensors(data);
        const timeRange = dataView.getTimerange();
        await dataView.refresh({ start: timeRange[0], end: timeRange[1] });
        extensions.forEach(ext => ext.dataView = dataView);
    };
    sensorMgrExt.onSensorDeleted = async (sensorId) => {
        await dataView.deleteSensors(sensorId);
        const timeRange = dataView.getTimerange();
        await dataView.refresh({ start: timeRange[0], end: timeRange[1] });
        extensions.forEach(ext => {
            ext.dataView = dataView;
            ext.currentSensorID = null;
        });
    };

    // Setup and auto-activate other viewer extensions
    const levelsExt = viewer.getExtension('Autodesk.AEC.LevelsExtension');
    levelsExt.levelsPanel.setVisible(true);
    levelsExt.floorSelector.addEventListener(Autodesk.AEC.FloorSelector.SELECTED_FLOOR_CHANGED, onLevelChanged);
    levelsExt.floorSelector.selectFloor(APS_MODEL_DEFAULT_FLOOR_INDEX, true);
    adjustPanelStyle(levelsExt.levelsPanel, { left: '10px', top: '10px', width: '300px', height: '300px' });

    onTimeRangeChanged(DEFAULT_TIMERANGE_START, DEFAULT_TIMERANGE_END);
    viewer.getExtension(SensorListExtensionID).onSensorClicked = (sensorId) => onCurrentSensorChanged(sensorId);
    viewer.getExtension(SensorSpritesExtensionID).onSensorClicked = (sensorId) => onCurrentSensorChanged(sensorId);
    viewer.getExtension(SensorHeatmapsExtensionID).onChannelChanged = (channelId) => onCurrentChannelChanged(channelId);
});
