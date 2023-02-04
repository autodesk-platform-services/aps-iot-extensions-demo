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

- Clone this repository
- Install dependencies: `yarn install`
- Setup environment variables:
    - `APS_CLIENT_ID` - client ID of your APS application
    - `APS_CLIENT_SECRET` - client secret of your APS application
- In [public/config.js](./public/config.js), modify `APS_MODEL_URN` and `APS_MODEL_VIEW` with your own model URN and view GUID
- In [./services/iot.mocked.js](./services/iot.mocked.js)
    - Modify the mocked up sensors,
for example, changing their `location` (XYZ position in the model's coordinate system)
or `objectId` (the dbID of the room the sensor should be associated with)

        > Note: the locations and object IDs in the mocked up data is setup specifically for the _rac\_basic\_sample\_project.rvt_ sample project from [Revit Sample Project Files](https://knowledge.autodesk.com/support/revit/getting-started/caas/CloudHelp/cloudhelp/2022/ENU/Revit-GetStarted/files/GUID-61EF2F22-3A1F-4317-B925-1E85F138BE88-htm.html).

    - Adjust the resolution and ranges of the randomly generated sensor data
- Run the app: `yarn start`
- Go to http://localhost:3000

> When using [Visual Studio Code](https://code.visualstudio.com), you can specify the env. variables listed above in a _.env_ file in this folder, and run & debug the application directly from the editor.

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT).
Please see the [LICENSE](LICENSE) file for more details.
