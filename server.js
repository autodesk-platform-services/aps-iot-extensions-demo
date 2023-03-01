const express = require('express');
const { getPublicToken } = require('./services/aps.js');
const { getSensors, getChannels, getSamples } = require('./services/influxdb.js');
const { APS_MODEL_URN, APS_MODEL_VIEW, APS_MODEL_DEFAULT_FLOOR_INDEX, DEFAULT_TIMERANGE_START, DEFAULT_TIMERANGE_END, PORT } = require('./config.js');

let app = express();
app.use(express.static('public'));
app.get('/auth/token', function (req, res, next) {
    getPublicToken().then(token => res.json(token)).catch(err => next(err));
});
app.get('/iot/sensors', function (req, res) {
    res.json(getSensors());
});
app.get('/iot/channels', function (req, res) {
    res.json(getChannels());
});
app.get('/iot/samples', function (req, res, next) {
    getSamples(new Date(req.query.start), new Date(req.query.end)).then(data => res.json(data)).catch(err => next(err));
});
app.get('/config.json', function (req, res) {
    res.json({ APS_MODEL_URN, APS_MODEL_VIEW, APS_MODEL_DEFAULT_FLOOR_INDEX, DEFAULT_TIMERANGE_START, DEFAULT_TIMERANGE_END });
});
app.listen(PORT, function () { console.log(`Server listening on port ${PORT}...`); });