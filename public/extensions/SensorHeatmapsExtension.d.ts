/// <reference types="forge-viewer" />
import { UIBaseExtension } from './BaseExtension.js';
import { HistoricalDataView, ChannelID } from './HistoricalDataView.js';
import { SensorHeatmapsPanel } from './SensorHeatmapsPanel.js';
export declare const SensorHeatmapsExtensionID = "IoT.SensorHeatmaps";
export declare class SensorHeatmapsExtension extends UIBaseExtension {
    panel?: SensorHeatmapsPanel;
    onChannelChanged?: (channelID: ChannelID) => void;
    protected _surfaceShadingData?: Autodesk.DataVisualization.Core.SurfaceShadingData;
    constructor(viewer: Autodesk.Viewing.GuiViewer3D, options?: any);
    protected onDataViewChanged(oldDataView?: HistoricalDataView, newDataView?: HistoricalDataView): void;
    protected onCurrentTimeChanged(oldTime?: Date, newTime?: Date): void;
    protected onCurrentChannelChanged(oldChannelID?: ChannelID, newChannelID?: ChannelID): void;
    protected getSensorValue(surfaceShadingPoint: Autodesk.DataVisualization.Core.SurfaceShadingPoint, sensorType: string): number;
    protected createHeatmaps(): Promise<void>;
    protected updateHeatmaps(): Promise<void>;
    protected updateChannels(): void;
    load(): Promise<boolean>;
    unload(): boolean;
    activate(): boolean;
    deactivate(): boolean;
    onToolbarCreated(): void;
    _setupSurfaceShading(model: Autodesk.Viewing.Model): Promise<void>;
}
