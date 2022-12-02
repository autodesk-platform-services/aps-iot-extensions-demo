/// import * as Autodesk from "@types/forge-viewer";
/**
 * Base class for all IoT extensions.
 *
 * Implements shared functionality such as the handling of state changes.
 */
export class BaseExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._dataView = undefined;
        this._currentTime = undefined;
        this._currentSensorID = undefined;
        this._currentChannelID = undefined;
        this._dataVizExt = null;
    }
    onDataViewChanged(oldDataView, newDataView) { }
    onCurrentTimeChanged(oldTime, newTime) { }
    onCurrentSensorChanged(oldSensorID, newSensorID) { }
    onCurrentChannelChanged(oldChannelID, newChannelID) { }
    getDefaultSensorID() {
        if (!this._dataView) {
            return undefined;
        }
        return this._dataView.getSensors().keys().next().value;
    }
    getDefaultChannelID() {
        if (!this._dataView) {
            return undefined;
        }
        return this._dataView.getChannels().keys().next().value;
    }
    get dataView() {
        return this._dataView;
    }
    set dataView(newDataView) {
        const oldDataView = this._dataView;
        this._dataView = newDataView;
        this.onDataViewChanged(oldDataView, newDataView);
    }
    get currentTime() {
        return this._currentTime || new Date();
    }
    set currentTime(newTime) {
        const oldTime = this._currentTime;
        this._currentTime = newTime;
        this.onCurrentTimeChanged(oldTime, newTime);
    }
    get currentSensorID() {
        return this._currentSensorID || this.getDefaultSensorID();
    }
    set currentSensorID(newSensorID) {
        const oldSensorID = this._currentSensorID;
        this._currentSensorID = newSensorID;
        this.onCurrentSensorChanged(oldSensorID, newSensorID);
    }
    get currentChannelID() {
        return this._currentChannelID || this.getDefaultChannelID();
    }
    set currentChannelID(newChannelID) {
        const oldChannelID = this._currentChannelID;
        this._currentChannelID = newChannelID;
        this.onCurrentChannelChanged(oldChannelID, newChannelID);
    }
    async load() {
        this._dataVizExt = await this.viewer.loadExtension('Autodesk.DataVisualization');
        return true;
    }
    unload() {
        this._dataVizExt = null;
        return true;
    }
    activate() {
        return true;
    }
    deactivate() {
        return true;
    }
    loadScript(url, namespace) {
        for (const script of document.querySelectorAll('script').values()) {
            if (script.src === url) {
                return Promise.resolve();
            }
        }
        // @ts-ignore
        if (namespace && window[namespace] !== undefined) {
            console.warn('Script is already loaded but not from the requested URL', url);
        }
        return new Promise(function (resolve, reject) {
            const script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', url);
            script.onload = () => resolve();
            script.onerror = (err) => reject(err);
            document.head.appendChild(script);
        });
    }
    loadStylesheet(url) {
        for (const link of document.querySelectorAll('link').values()) {
            if (link.href === url) {
                return Promise.resolve();
            }
        }
        return new Promise(function (resolve, reject) {
            const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.setAttribute('href', url);
            link.onload = () => resolve();
            link.onerror = (err) => reject(err);
            document.head.appendChild(link);
        });
    }
}
const ToolbarGroupID = 'iot-toolbar';
/**
 * Base class for all IoT extensions.
 *
 * Implements shared functionality such as the toolbar initialization.
 */
export class UIBaseExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this._group = undefined;
        this._button = undefined;
    }
    unload() {
        super.unload();
        this.removeToolbarButton();
        return true;
    }
    activate() {
        var _a;
        super.activate();
        (_a = this._button) === null || _a === void 0 ? void 0 : _a.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);
        this.activeStatus = true; // TODO: update @types/forge-viewer
        return true;
    }
    deactivate() {
        var _a;
        super.deactivate();
        (_a = this._button) === null || _a === void 0 ? void 0 : _a.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
        this.activeStatus = false; // TODO: update @types/forge-viewer
        return true;
    }
    createToolbarButton(buttonId, buttonTooltip, buttonIconUrl) {
        this._group = this.viewer.toolbar.getControl(ToolbarGroupID);
        if (!this._group) {
            this._group = new Autodesk.Viewing.UI.ControlGroup(ToolbarGroupID);
            this.viewer.toolbar.addControl(this._group);
        }
        this._button = new Autodesk.Viewing.UI.Button(buttonId);
        this._button.onClick = (ev) => {
            this.setActive(!this.isActive(''), '');
        };
        const icon = this._button.container.querySelector('.adsk-button-icon'); // TODO: update @types/forge-viewer
        if (icon) {
            icon.style.backgroundImage = `url(${buttonIconUrl})`;
            icon.style.backgroundSize = `24px`;
            icon.style.backgroundRepeat = `no-repeat`;
            icon.style.backgroundPosition = `center`;
            icon.style.filter = 'invert(1)';
        }
        this._button.setToolTip(buttonTooltip);
        this._group.addControl(this._button);
    }
    removeToolbarButton() {
        if (this._group && this._button) {
            this._group.removeControl(this._button);
            if (this._group.getNumberOfControls() === 0) {
                this.viewer.toolbar.removeControl(this._group);
            }
            this._button = undefined;
            this._group = undefined;
        }
    }
}
