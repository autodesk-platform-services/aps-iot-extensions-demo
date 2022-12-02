/// <reference types="forge-viewer" />
import { HistoricalDataView, ChannelID } from './HistoricalDataView.js';
export declare class SensorHeatmapsPanel extends Autodesk.Viewing.UI.DockingPanel {
    protected dropdown?: HTMLSelectElement;
    protected canvas?: HTMLCanvasElement;
    onChannelChanged?: (channelID: ChannelID) => void;
    constructor(viewer: Autodesk.Viewing.GuiViewer3D, id: string, title: string, options?: any);
    initialize(): void;
    updateChannels(dataView: HistoricalDataView): void;
    onDropdownChanged(dataView: HistoricalDataView): void;
    updateLegend(labels: string[], colorStops: string[]): void;
}
