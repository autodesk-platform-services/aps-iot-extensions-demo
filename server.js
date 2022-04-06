const path = require('path');
const jsonServer = require('json-server');
const { getPublicToken } = require('./services/forge.js');
const { getSamples } = require('./services/iot.mocked.js');
const { PORT } = require('./config.js');

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
app.use(router);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});

app.listen(PORT, function () { console.log(`Server listening on port ${PORT}...`); });
