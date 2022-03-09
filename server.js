const express = require('express');
const { getPublicToken } = require('./services/forge.js');
const { getSensors, getSensorData } = require('./services/iot.mocked.js');
const { PORT } = require('./config.js');

let app = express();
app.use(express.static('public'));

app.get('/auth/token', async function (req, res, next) {
    try {
        res.json(await getPublicToken());
    } catch (err) {
        next(err);
    }
});

app.get('/iot/sensors', async function (req, res, next) {
    try {
        res.json(await getSensors());
    } catch (err) {
        next(err);
    }
});

app.get('/iot/data', async function (req, res, next) {
    try {
        res.json(await getSensorData({ start: new Date(req.query.start), end: new Date(req.query.end) }));
    } catch (err) {
        next(err);
    }
});

app.use(function (err, req, res, next) {
    console.error(err);
    res.status(500).send(err.message);
});

app.listen(PORT, function () { console.log(`Server listening on port ${PORT}...`); });
