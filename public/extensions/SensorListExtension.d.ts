/// <reference types="forge-viewer" />
import { UIBaseExtension } from './BaseExtension.js';
import { HistoricalDataView, SensorID } from './HistoricalDataView.js';
import { SensorListPanel } from './SensorListPanel.js';
export declare const SensorListExtensionID = "IoT.SensorList";
export declare class SensorListExtension extends UIBaseExtension {
    panel?: SensorListPanel;
    onSensorClicked?: (sensor: SensorID) => void;
    constructor(viewer: Autodesk.Viewing.GuiViewer3D, options?: any);
    onDataViewChanged(oldDataView?: HistoricalDataView, newDataView?: HistoricalDataView): void;
    onCurrentTimeChanged(oldTime?: Date, newTime?: Date): void;
    protected update(updateColumns: boolean): void;
    load(): Promise<boolean>;
    unload(): boolean;
    activate(): boolean;
    deactivate(): boolean;
    onToolbarCreated(): void;
}
