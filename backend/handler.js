const debug = require("debug")("node-angular");

let handler = {};

handler.normalizePort = val => {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
};

handler.onError = error => {
    console.log('working')
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = typeof port === "string" ? "pipe " + port : "port " + port;
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
};

handler.onListening = (port) => {
    console.log('working')
    const bind = typeof port === "string" ? "pipe " + port : "port " + port;
    debug("Listening on " + bind);
};

module.exports = handler;