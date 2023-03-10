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
- [InfluxDB Cloud](https://www.influxdata.com/products/influxdb-cloud/) account
- [Node.js](https://nodejs.org) runtime
- [Yarn](https://yarnpkg.com) package manager
- Terminal (for example, [Windows Command Prompt](https://en.wikipedia.org/wiki/Cmd.exe) or [macOS Terminal](https://support.apple.com/guide/terminal/welcome/mac))

### Running locally

> The code sample is currently hard-coded to work well with a specific BIM model and a specific set of InfluxDB data. Please refer to the [Sample data](#sample-data) section below for more details.

- clone this repository
- create a `.env` file in the project folder providing the following env. variables (see `.env.example` for reference):
    - `APS_CLIENT_ID` - client ID of your APS application (**required**)
    - `APS_CLIENT_SECRET` - client secret of your APS application (**required**)
    - `APS_MODEL_URN` - URN of a design you want to load into the viewer (**required**)
    - `APS_MODEL_VIEW` - GUID of a specific model view you want to load into the viewer (optional)
    - `APS_MODEL_DEFAULT_FLOOR_INDEX` - floor number to show at the beginning (optional, `1` by default)
    - `DEFAULT_TIMERANGE_START` - start of the time range to show in the viewer in [ISO string format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) (optional; `"2023-01-01"` by default)
    - `DEFAULT_TIMERANGE_END` - end of the time range to show in the viewer in [ISO string format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) (optional; `"2023-04-01"` by default)
    - `INFLUXDB_URL` - InfluxDB Cloud URL (**required**; for example, `"https://us-east-1-1.aws.cloud2.influxdata.com"`)
    - `INFLUXDB_ORG` - your InfluxDB organization name (**required**)
    - `INFLUXDB_BUCKET` - your InfluxDB bucket name (**required**)
    - `INFLUXDB_TOKEN` - your InfluxDB access token (**required**)
    - `PORT` - port number for the server app (optional, `3000` by default)
    - Install dependencies: `yarn install`
    - Run the app: `yarn start`
    - Go to http://localhost:3000

### Sample data

If you want to try the application as-is, use the following sample data:

- BIM model: _rac\_basic\_sample\_project.rvt_ sample project from [Revit Sample Project Files](https://knowledge.autodesk.com/support/revit/getting-started/caas/CloudHelp/cloudhelp/2022/ENU/Revit-GetStarted/files/GUID-61EF2F22-3A1F-4317-B925-1E85F138BE88-htm.html)
  - Upload this model to your own OSS bucket, and translate it so that it can be loaded in the viewer
- InfluxDB data: [./air-sensor-data.lp](./air-sensor-data.lp)
  - Load this data into your InfluxDB bucket ([tutorial](https://docs.influxdata.com/influxdb/cloud/write-data/no-code/load-data/))

If you want to use your own BIM model and/or InfluxDB data, you'll need to adjust the code in [./services/influxdb.js](./services/influxdb.js):

- Adjust the `SENSORS` array; each sensor's `id` must match the ID used in your InfluxDB data, and the `location` and/or `objectId` must correspond to the BIM model
- Adjust the `CHANNELS` array; each channel's `id` must match the `_field` values used in your InfluxDB data
- Adjust the column names based your InfluxDB data; currently the query assumes the IoT data looks like this:

| _time               | _field         | _value         | sensor_id      |
|---------------------|----------------|----------------|----------------|
| 2023-03-01T09:00:00 | temperature    | 75.0           | TLM0100        |
| 2023-03-01T09:00:00 | co             | 560.0          | TLM0100        |
| 2023-03-01T09:00:00 | humidity       | 33.3           | TLM0100        |
| 2023-03-01T09:00:00 | temperature    | 74.0           | TLM0101        |
| 2023-03-01T09:00:00 | co             | 550.0          | TLM0101        |
| 2023-03-01T09:00:00 | humidity       | 30.0           | TLM0101        |
| 2023-03-01T09:00:00 | temperature    | 76.4           | TLM0102        |
| 2023-03-01T09:00:00 | co             | 500.0          | TLM0102        |
| 2023-03-01T09:00:00 | humidity       | 28.5           | TLM0102        |
| 2023-03-01T09:05:00 | temperature    | 74.5           | TLM0100        |
| 2023-03-01T09:05:00 | co             | 559.5          | TLM0100        |
| 2023-03-01T09:05:00 | humidity       | 33.0           | TLM0100        |

If you use different column names, update the `SENSOR_ID_COLUMN_NAME`, `CHANNEL_ID_COLUMN_NAME`, `TIMESTAMP_COLUMN_NAME`, and `VALUE_COLUMN_NAME` consts accordingly.

## Tips & Tricks

If you need to find all _room volumes_ in a Revit design (for example, to apply heatmaps to them), you can use the following viewer method in the browser console:

```js
NOP_VIEWER.search('Revit Rooms', ids => { console.log('Room volume object IDs', ids); }, err => { console.error(err); }, ['Category'], { searchHidden: true });
```

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for more details.