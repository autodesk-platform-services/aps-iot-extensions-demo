/// <reference types="chart.js" />
/// <reference types="forge-viewer" />
import { HistoricalDataView, SensorID } from './HistoricalDataView.js';
export declare class SensorDetailPanel extends Autodesk.Viewing.UI.DockingPanel {
    protected _charts: Chart[];
    protected _lastHighlightedPointIndex: number;
    constructor(viewer: Autodesk.Viewing.GuiViewer3D, id: string, title: string, options?: any);
    initialize(): void;
    updateCharts(sensorId: SensorID, dataView: HistoricalDataView): void;
    _createChart(canvas: HTMLCanvasElement, timestamps: Date[], values: number[], min: number, max: number, title: string): import("chart.js");
    updateCursor(sensorId: SensorID, dataView: HistoricalDataView, currentTime: Date): void;
}
