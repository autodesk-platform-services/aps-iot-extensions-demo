const express = require('express');
const { getPublicToken } = require('./services/forge.js');
const { getSensors, getChannels, getSamples } = require('./services/iot.sqlite.js');
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

app.get('/iot/channels', async function (req, res, next) {
    try {
        res.json(await getChannels());
    } catch (err) {
        next(err);
    }
});

app.get('/iot/samples', async function (req, res, next) {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            throw new Error('Missing some of the required query parameters: "start", "end".');
        }
        res.json(await getSamples(new Date(start), new Date(end)));
    } catch (err) {
        next(err);
    }
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});

app.listen(PORT, function () { console.log(`Server listening on port ${PORT}...`); });
