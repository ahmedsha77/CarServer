require('dotenv').config();
const express = require('express');
const app = express();
const car = require('./controllers/CarController');
const sequelize = require('./db');


sequelize.sync();
app.use(express.json());
app.use(require('./middleware/headers'));

app.use('/api', car);

app.listen(process.env.PORT, () => console.log(`app is listening on ${process.env.PORT}`));

