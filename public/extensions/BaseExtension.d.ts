/// <reference types="forge-viewer" />
import { SensorID, ChannelID, HistoricalDataView } from './HistoricalDataView.js';
/**
 * Base class for all IoT extensions.
 *
 * Implements shared functionality such as the handling of state changes.
 */
export declare abstract class BaseExtension extends Autodesk.Viewing.Extension {
    protected _dataView?: HistoricalDataView;
    protected _currentTime?: Date;
    protected _currentSensorID?: SensorID;
    protected _currentChannelID?: ChannelID;
    protected _dataVizExt: any;
    constructor(viewer: Autodesk.Viewing.GuiViewer3D, options?: any);
    protected onDataViewChanged(oldDataView?: HistoricalDataView, newDataView?: HistoricalDataView): void;
    protected onCurrentTimeChanged(oldTime?: Date, newTime?: Date): void;
    protected onCurrentSensorChanged(oldSensorID?: SensorID, newSensorID?: SensorID): void;
    protected onCurrentChannelChanged(oldChannelID?: ChannelID, newChannelID?: ChannelID): void;
    protected getDefaultSensorID(): SensorID | undefined;
    protected getDefaultChannelID(): ChannelID | undefined;
    get dataView(): HistoricalDataView | undefined;
    set dataView(newDataView: HistoricalDataView | undefined);
    get currentTime(): Date;
    set currentTime(newTime: Date | undefined);
    get currentSensorID(): SensorID | undefined;
    set currentSensorID(newSensorID: SensorID | undefined);
    get currentChannelID(): ChannelID | undefined;
    set currentChannelID(newChannelID: ChannelID | undefined);
    load(): Promise<boolean>;
    unload(): boolean;
    activate(): boolean;
    deactivate(): boolean;
    protected loadScript(url: string, namespace?: string): Promise<void>;
    protected loadStylesheet(url: string): Promise<void>;
}
/**
 * Base class for all IoT extensions.
 *
 * Implements shared functionality such as the toolbar initialization.
 */
export declare abstract class UIBaseExtension extends BaseExtension {
    protected _group?: Autodesk.Viewing.UI.ControlGroup;
    protected _button?: Autodesk.Viewing.UI.Button;
    constructor(viewer: Autodesk.Viewing.GuiViewer3D, options?: any);
    unload(): boolean;
    activate(): boolean;
    deactivate(): boolean;
    protected createToolbarButton(buttonId: string, buttonTooltip: string, buttonIconUrl: string): void;
    protected removeToolbarButton(): void;
}
