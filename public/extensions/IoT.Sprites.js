/// import * as Autodesk from "@types/forge-viewer";

class SpritesExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this._style = null;
        this._onSpriteClicked = this._onSpriteClicked.bind(this);
        this._dbIdToSensorId = new Map();
        this.onSensorClicked = null;
    }

    onDataChange({ sensors, historicalData, currentSensorID, currentChannelID, currentTimestamp }) {
        // TODO: only update what needs to be updated
        if (sensors) {
            if (this.isActive()) {
                this._refreshSprites();
            }
        }
    }

    async load() {
        await super.load();
        this._style = this._createVisualStyle();
        this.viewer.addEventListener(Autodesk.DataVisualization.Core.MOUSE_CLICK, this._onSpriteClicked);
        console.log('IoT.Sprites extension loaded.');
        return true;
    }

    async unload() {
        super.unload();
        this._style = null;
        this.viewer.removeEventListener(Autodesk.DataVisualization.Core.MOUSE_CLICK, this._onSpriteClicked);
        console.log('IoT.Sprites extension unloaded.');
        return true;
    }

    activate() {
        super.activate();
        this._refreshSprites();
    }

    deactivate() {
        super.deactivate();
        this._dataVizExt.removeAllViewables();
    }

    onToolbarCreated() {
        this._createToolbarUI('iot-sensor-sprites-btn', 'IoT Sensor Sprites', 'https://img.icons8.com/ios-filled/50/000000/iot-sensor.png'); // <a href="https://icons8.com/icon/61307/iot-sensor">IoT Sensor icon by Icons8</a>
    }

    _onSpriteClicked(ev) {
        if (this.onSensorClicked) {
            this.onSensorClicked(this._dbIdToSensorId.get(ev.dbId));
        }
    }

    _refreshSprites() {
        this._dataVizExt.removeAllViewables();
        if (!this._sensors) {
            return;
        }
        const viewableData = new Autodesk.DataVisualization.Core.ViewableData();
        viewableData.spriteSize = 32;
        this._dbIdToSensorId.clear();
        let dbid = 1000000;
        for (const [sensorId, sensor] of this._sensors.entries()) {
            this._dbIdToSensorId.set(dbid, sensorId);
            const viewable = new Autodesk.DataVisualization.Core.SpriteViewable(sensor.location, this._style, dbid++);
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

Autodesk.Viewing.theExtensionManager.registerExtension('IoT.Sprites', SpritesExtension);
