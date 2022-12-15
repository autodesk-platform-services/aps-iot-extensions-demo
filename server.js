const path = require('path');
const URL = require('url');
const jsonServer = require('json-server');
const { getPublicToken } = require('./services/aps.js');
const { getSamples } = require('./services/iot.mocked.js');
const { PORT, APS_SAMPLE_ENVIRONMENT, APS_MAXIMUM_SENSOR_NUMBER } = require('./config.js');

const router = jsonServer.router(path.join(__dirname, './services/db.json'), { foreignKeySuffix: '_id' });

const app = jsonServer.create();
app.use(jsonServer.defaults({
    static: path.join(__dirname, './public'),
    bodyParser: true
}));

app.get('/auth/token', async function (req, res, next) {
    try {
        res.json(await getPublicToken());
    } catch (err) {
        next(err);
    }
});

app.get('/iot/samples', async function (req, res, next) {
    try {
        const { start, end, resolution } = req.query;
        if (!start || !end || !resolution) {
            throw new Error('Missing some of the required parameters: "start", "end", "resolution".');
        }
        const sensors = router.db.get('sensors').value();
        res.json(await getSamples(sensors, { start: new Date(start), end: new Date(end) }, resolution));
    } catch (err) {
        next(err);
    }
});

app.use(jsonServer.rewriter({ '/iot/*': '/$1' }));

if (APS_SAMPLE_ENVIRONMENT == 'Demonstration') {
    console.log(`Server running on Demonstration mode...`);
    app.use((req, res, next) => {
        try {
            if (req.url.includes('sensors') && req.method != 'GET') {
                let url = URL.parse(req.url);
                let pathNames = url.pathname.split('/');
                let id = parseInt(pathNames[pathNames.length - 1]);

                if (req.method == 'POST') {
                    let sensors = router.db.get('sensors').value();
                    if (sensors.length >= APS_MAXIMUM_SENSOR_NUMBER)
                        throw new Error(`Demo mode doesn't support having more than ${APS_MAXIMUM_SENSOR_NUMBER} \`sensors\` in total.`);
                } else if (req.method == 'DELETE') {
                    let sensor = router.db.get('sensors').find({ id }).value();
                    if (sensor && sensor.immutable)
                        throw new Error(`Demo mode doesn't support deleting demo sensors data. Try to add your sensors by clicking the \`+\` button on the toolbar.`);
                } else {
                    throw new Error(`Demo mode doesn't support manipulating \`sensors\` data.`);
                }
            }

            if (req.url.includes('channels') && req.method != 'GET') {
                throw new Error(`Demo mode doesn't support manipulating \`channels\` data.`);
            }

            next();
        } catch (error) {
            res.status(403).json({
                code: 403,
                error: 'Unsupported Operation',
                detail: error.message
            });
        }
    });
}

app.use(router);
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});

app.listen(PORT, function () { console.log(`Server listening on port ${PORT}...`); });
