const JwtService = require('../modules/auth/jwtService')
const unauthorizedError = require('../error/UnauthorizedError')

const authJwt = (req, res, next) => {
    const authHeader = req.headers.authorization
    
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new unauthorizedError("Token tidak di temukan")
    }
    
    const token = authHeader.split(' ')[1]
    
    try {
        const decoded = JwtService.verify(token)
        req.user = decoded
        req.userid = decoded.id
        next()
    } catch(e) {
        throw new unauthorizedError("Token ini sudah tidak valid atau sudah kedaluarsa")
    }
}

module.exports = authJwt