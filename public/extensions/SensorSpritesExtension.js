/// import * as Autodesk from "@types/forge-viewer";
import { UIBaseExtension } from './BaseExtension.js';
export const SensorSpritesExtensionID = 'IoT.SensorSprites';
export class SensorSpritesExtension extends UIBaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this._onSpriteClicked = this._onSpriteClicked.bind(this);
        this._dbIdToSensorId = new Map();
        this.update = this.update.bind(this);
    }
    onDataViewChanged(oldDataView, newDataView) { this.update(); }
    update() {
        if (this.isActive()) { // TODO: update @types/forge-viewer
            this._refreshSprites();
        }
    }
    async load() {
        await super.load();
        this._style = this._createVisualStyle();
        this.viewer.addEventListener(Autodesk.DataVisualization.Core.MOUSE_CLICK, this._onSpriteClicked);
        console.log(`${SensorSpritesExtensionID} extension loaded.`);
        return true;
    }
    unload() {
        super.unload();
        this._style = undefined;
        this.viewer.removeEventListener(Autodesk.DataVisualization.Core.MOUSE_CLICK, this._onSpriteClicked);
        console.log(`${SensorSpritesExtensionID} extension unloaded.`);
        return true;
    }
    activate() {
        super.activate();
        this._refreshSprites();
        return true;
    }
    deactivate() {
        super.deactivate();
        this._dataVizExt.removeAllViewables();
        return true;
    }
    onToolbarCreated() {
        this.createToolbarButton('iot-sensor-sprites-btn', 'IoT Sensor Sprites', 'https://img.icons8.com/ios-filled/50/000000/iot-sensor.png'); // <a href="https://icons8.com/icon/61307/iot-sensor">IoT Sensor icon by Icons8</a>
    }
    _onSpriteClicked(ev) {
        if (this.onSensorClicked) {
            this.onSensorClicked(this._dbIdToSensorId.get(ev.dbId));
        }
    }
    _refreshSprites() {
        this._dataVizExt.removeAllViewables();
        if (!this.dataView) {
            return;
        }
        const viewableData = new Autodesk.DataVisualization.Core.ViewableData();
        viewableData.spriteSize = 32;
        this._dbIdToSensorId.clear();
        let dbid = 1000000;
        for (const [sensorId, sensor] of this.dataView.getSensors().entries()) {
            this._dbIdToSensorId.set(dbid, sensorId);
            const { x, y, z } = sensor.location;
            const style = this._style;
            const viewable = new Autodesk.DataVisualization.Core.SpriteViewable(new THREE.Vector3(x, y, z), style, dbid++);
            viewableData.addViewable(viewable);
        }
        viewableData.finish().then(() => {
            this._dataVizExt.addViewables(viewableData);
        });
    }
    _createVisualStyle() {
        const DataVizCore = Autodesk.DataVisualization.Core;
        const viewableType = DataVizCore.ViewableType.SPRITE;
        const spriteColor = new THREE.Color(0xffffff);
        const spriteIconUrl = 'https://img.icons8.com/color/48/000000/electrical-sensor.png'; // <a href="https://icons8.com/icon/12096/proximity-sensor">Proximity Sensor icon by Icons8</a>
        return new DataVizCore.ViewableStyle(viewableType, spriteColor, spriteIconUrl);
    }
}
