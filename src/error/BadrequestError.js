const HttpError = require('./HttpError');

class BadrequestError extends HttpError {
    constructor(message = "Not Found") {
        super(message, 400);
        this.name = "BadrequestError"
    }
}

module.exports = BadrequestError