# APS DataViz Extensions Demo

![platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![node.js](https://img.shields.io/badge/Node.js-16.17-blue.svg)](https://nodejs.org)
[![npm](https://img.shields.io/badge/npm-8.15-blue.svg)](https://www.npmjs.com/)
[![license](https://img.shields.io/:license-mit-green.svg)](https://opensource.org/licenses/MIT)

Sample [Autodesk Platform Services](https://aps.autodesk.com) application with a set of custom viewer extensions (built on top of the [Data Visualization Extensions](https://forge.autodesk.com/en/docs/dataviz/v1/developers_guide/introduction)) used to display historical IoT data in a BIM model.

Live demo: https://aps-iot-extensions-demo.autodesk.io

![thumbnail](./thumbnail.png)

## Setup

### Prerequisites

- [APS credentials](https://forge.autodesk.com/en/docs/oauth/v2/tutorials/create-app)
- [Node.js](https://nodejs.org)
- [Yarn package manager](https://yarnpkg.com)
- Terminal (for example, [Windows Command Prompt](https://en.wikipedia.org/wiki/Cmd.exe) or [macOS Terminal](https://support.apple.com/guide/terminal/welcome/mac))

### Running locally

- clone this repository
- create a `.env` file in the project folder providing the following env. variables:
    - `APS_CLIENT_ID` - client ID of your APS application (**required**)
    - `APS_CLIENT_SECRET` - client secret of your APS application (**required**)
    - `APS_MODEL_URN` - URN of a design you want to load into the viewer (**required**)
    - `APS_MODEL_VIEW` - GUID of a specific model view you want to load into the viewer (optional)
    - `APS_MODEL_DEFAULT_FLOOR_INDEX` - floor number to show at the beginning (optional, `1` by default)
    - `DEFAULT_TIMERANGE_START` - start of the time range to show in the viewer in [ISO string format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) (optional; `"2023-01-01"` by default)
    - `DEFAULT_TIMERANGE_END` - end of the time range to show in the viewer in [ISO string format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) (optional; `"2023-04-01"` by default)
    - `INFLUXDB_URL` - InfluxDB cloud URL (**required**; for example, `"https://us-east-1-1.aws.cloud2.influxdata.com"`)
    - `INFLUXDB_ORG` - your InfluxDB organization name (**required**)
    - `INFLUXDB_BUCKET` - your InfluxDB bucket name (**required**)
    - `INFLUXDB_TOKEN` - your InfluxDB access token (**required**)
    - `PORT` - port number for the server app (optional, `3000` by default)
- tweak the hard-coded sensors and channels [./services/influxdb.js](./services/influxdb.js) based on your specific use case:
    - the IDs of sensors and channels should match the `sensor_id` and `_field` values you have in your InfluxDB dataset
    - the `location` (XYZ position in the model's coordinate system) or `objectId` (the dbID of the room the sensor should be associated with) should map to existing rooms in your BIM model

        > Note: the locations and object IDs in the hard-coded sensors are setup specifically for the _rac\_basic\_sample\_project.rvt_ sample project from [Revit Sample Project Files](https://knowledge.autodesk.com/support/revit/getting-started/caas/CloudHelp/cloudhelp/2022/ENU/Revit-GetStarted/files/GUID-61EF2F22-3A1F-4317-B925-1E85F138BE88-htm.html).

- Install dependencies: `yarn install`
- Run the app: `yarn start`
- Go to http://localhost:3000

## Tips & Tricks

If you need to find all _room volumes_ in a Revit design (for example, to apply heatmaps to them), you can use the following viewer method in the browser console:

```js
NOP_VIEWER.search('Revit Rooms', ids => { console.log('Room volume object IDs', ids); }, err => { console.error(err); }, ['Category'], { searchHidden: true });
```

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for more details.