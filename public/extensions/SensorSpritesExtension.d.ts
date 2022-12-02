/// <reference types="forge-viewer" />
import { UIBaseExtension } from './BaseExtension.js';
import { HistoricalDataView, SensorID } from './HistoricalDataView.js';
export declare const SensorSpritesExtensionID = "IoT.SensorSprites";
export declare class SensorSpritesExtension extends UIBaseExtension {
    protected _style?: Autodesk.DataVisualization.Core.ViewableStyle;
    onSensorClicked?: (sensor: SensorID) => void;
    protected _dbIdToSensorId: Map<number, SensorID>;
    constructor(viewer: Autodesk.Viewing.GuiViewer3D, options?: any);
    protected onDataViewChanged(oldDataView?: HistoricalDataView, newDataView?: HistoricalDataView): void;
    protected update(): void;
    load(): Promise<boolean>;
    unload(): boolean;
    activate(): boolean;
    deactivate(): boolean;
    onToolbarCreated(): void;
    _onSpriteClicked(ev: any): void;
    _refreshSprites(): void;
    _createVisualStyle(): Autodesk.DataVisualization.Core.ViewableStyle;
}
