const api = require('./config');
const express = require('express');
const cors = require('cors');
const app = express();

const chainalysisRoute = require('./routes/chainalysis');

const settings = api.settings;

app.use(cors({
    origin: "*"
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/user_details/:user_id', pgController.user_details);

app.get('/', (_req, _res) => {
    return _res.status(200).send(
        'Welcome to NEAR REST API!'
    );
});

app.use('/chainalysis', chainalysisRoute);

app.listen(settings.server_port, async () => {
    api.setEnvForProd();
    console.log(`Example app listening at http://localhost:${settings.server_port}`)
})

