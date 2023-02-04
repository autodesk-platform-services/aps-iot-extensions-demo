Experimental set of [Autodesk Platform Services](https://aps.autodesk.com) viewer extensions built on top of
the [Data Visualization extensions](https://forge.autodesk.com/en/docs/dataviz/v1/developers_guide/introduction/overview/),
allowing developers to easily visualize historical IoT data.

## Extensions

### SensorListExtension

Displays a table of all available sensor devices and their current readings. Clicking on one of the sensors in the table
will move the viewer camera to its position, and the sensor will be marked as _selected_, meaning that other extensions
(such as the `SensorDetailExtension` below) may potentially display information specific to this sensor.

### SensorSpritesExtension

Displays all available sensor devices as sprites in the 3D view. Clicking on one of the sprites will mark the corresponding
sensor as _selected_, meaning that other extensions (such as the `SensorDetailExtension` below) may potentially display
information specific to this sensor.

### SensorDetailExtension

Displays detailed information about the currently selected sensor device. Currently, the extension displays line charts
with all values read by the sensor in the currently specified time range.

### SensorHeatmapsExtension

Renders the current readings of all sensor devices in form of heatmaps applied to corresponding room volumes in the 3D view.
The extension also displays a small panel with a color legend, and a dropdown that can be used to switch between different
sensor readings.

## Usage

- import the extensions into your web application as ES6 modules, either individually, or using the `index.js` file (which includes
all the extensions, and it also registers them with the `Autodesk.Viewing.theExtensionManager`)
- load the desired extensions into your viewer
- implement your own "data view" based on the [HistoricalDataView](./HistoricalDataView.d.ts) interface
- control the state of the extensions through properties such as `dataView`, `currentTime`, `currentSensorID`, or `currentChannelID`
