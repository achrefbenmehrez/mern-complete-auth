const mongoose = require('mongoose');

require('dotenv').config({
    path: './config/config.env'
});

const connectDb = async () => {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: true,
        useUnifiedTopology: true
    });

    console.log('MongoDb connected on'+connection.connection.host);
}

module.exports = connectDb;