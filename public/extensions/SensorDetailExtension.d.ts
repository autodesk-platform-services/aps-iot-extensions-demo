/// <reference types="forge-viewer" />
import { UIBaseExtension } from './BaseExtension.js';
import { HistoricalDataView, SensorID } from './HistoricalDataView.js';
import { SensorDetailPanel } from './SensorDetailPanel.js';
export declare const SensorDetailExtensionID = "IoT.SensorDetail";
export declare class SensorDetailExtension extends UIBaseExtension {
    panel?: SensorDetailPanel;
    constructor(viewer: Autodesk.Viewing.GuiViewer3D, options?: any);
    protected onDataViewChanged(oldDataView?: HistoricalDataView, newDataView?: HistoricalDataView): void;
    protected onCurrentTimeChanged(oldTime?: Date, newTime?: Date): void;
    protected onCurrentSensorChanged(oldSensorID?: SensorID, newSensorID?: SensorID): void;
    protected updateCharts(): void;
    protected updateCursor(): void;
    load(): Promise<boolean>;
    unload(): boolean;
    activate(): boolean;
    deactivate(): boolean;
    onToolbarCreated(): void;
}
