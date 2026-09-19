const HttpError = require('./HttpError');

class Notfound extends HttpError {
    constructor(message = "Not Found") {
        super(message, 404);
        this.name = "NotFoundError"
    }
}

module.exports = Notfound;