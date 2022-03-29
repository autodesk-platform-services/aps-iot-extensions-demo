# forge-iot-example

Example [Autodesk Forge](https://forge.autodesk.com) application using
the [Data Visualization Extensions](https://forge.autodesk.com/en/docs/dataviz/v1/developers_guide/introduction)
to display historical IoT data in a BIM model.

Live demo: https://forge-iot-example.herokuapp.com

![Screenshot](./screenshot.png)

## Running locally

- Clone this repository
- Install dependencies: `yarn install`
- Setup environment variables:
    - `FORGE_CLIENT_ID` - client ID of your Forge application
    - `FORGE_CLIENT_SECRET` - client secret of your Forge application
- In [./public/index.js](./public/index.js), modify `FORGE_MODEL_URN` and `FORGE_MODEL_VIEW`
with your own model URN and view GUID
- In [./services/iot.mocked.js](./services/iot.mocked.js), modify the mocked up sensors,
for example, changing their `location` (XYZ position in the model's coordinate system)
or `objectId` (the dbID of the room the sensor should be associated with)
- Run the app: `yarn start`
- Go to http://localhost:3000
