const HttpError = require('../error/HttpError')

function errorHandler(error, req, res, next) {
    if (error instanceof HttpError) {
        res.status(error.statusCode).json({
            success: true,
            message: error.message
        })
        
        return;
    }
    
    if(process.env.NODE_ENV === "development") {
        if(error instanceof Error) {
            return res.status(500).json({
                success: true,
                message: error.message
            })
        }
        
    }
    
    console.error(error)
    
    return res.status(500).json({
        status: false,
        message: "Server Error"
    })
    
}

module.exports = errorHandler