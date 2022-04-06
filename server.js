const jsonServer = require('json-server');
const path = require('path');

const routes = require('./services/routes.json');
const dbFile = path.join(__dirname, './services/db.json');
const foreignKeySuffix = '_id';
const router = jsonServer.router(dbFile, { foreignKeySuffix });
const defaultsOpts = {
    static: path.join(process.cwd(), './public'),
    bodyParser: true
};
const middlewares = jsonServer.defaults(defaultsOpts);
const rewriter = jsonServer.rewriter(routes);

const app = jsonServer.create();
app.use(middlewares);

const { getPublicToken } = require('./services/forge.js');
const { getSamples } = require('./services/iot.mocked.js');
const { PORT } = require('./config.js');

app.get('/auth/token', async function (req, res, next) {
    try {
        res.json(await getPublicToken());
    } catch (err) {
        next(err);
    }
});

app.get('/iot/samples', async function (req, res, next) {
    try {
        const lowdb = router.db;
        const sensors = lowdb.get('sensors').value();

        res.json(await getSamples(sensors, { start: new Date(req.query.start), end: new Date(req.query.end) }, req.query.resolution));
    } catch (err) {
        next(err);
    }
});

app.use((err, req, res, next) => {
    if (!err) {
        next();
    } else {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.use(rewriter);
app.use(router);
app.listen(PORT, function () { console.log(`Server listening on port ${PORT}...`); });
