/// <reference types="forge-viewer" />
import { HistoricalDataView, SensorID } from './HistoricalDataView.js';
export declare class SensorListPanel extends Autodesk.Viewing.UI.PropertyPanel {
    onSensorClicked?: (sensor: SensorID) => void;
    protected table?: Tabulator;
    constructor(viewer: Autodesk.Viewing.GuiViewer3D, id: string, title: string, options?: any);
    initialize(): void;
    update(dataView: HistoricalDataView, timestamp: Date, updateColumns: boolean): void;
}
