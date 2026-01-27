const http = require('http');
const handler = require('./handler');
const mongoose = require('mongoose');
const app = require('./app')

const hostName = '0.0.0.0';

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("MongoDb connected")
});

const port = handler.normalizePort(process.env.PORT || "3000");

const server = http.createServer(app)
app.set('port', port)
server.on("error", handler.onError);
server.on("listening", handler.onListening);

app.listen(port, hostName, () => {
    console.log(`Server running at http://${hostName}:${port}/`)
})
