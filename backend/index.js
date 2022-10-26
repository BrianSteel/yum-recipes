const http = require('http');
const handler = require('./handler');
const app = require('./app')


const hostName = '127.0.0.1';

//process.env.PORT is when hosting service provides us the port number.
const port = handler.normalizePort(process.env.PORT || "3000");

const server = http.createServer(app)
app.set('port', port)
server.on("error", handler.onError);
server.on("listening", handler.onListening);

app.listen(port, hostName, () => {
    console.log(`Server running at http://${hostName}:${port}/`)
})
