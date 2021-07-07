const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDb = require('./config/db')

const app = express();

connectDb();

require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors());

app.use(morgan('dev'));

const authRoutes = require('./routes/user');

app.use('/users', authRoutes);

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Page not found'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
})