const authService = require('./auth.service')

class authCOntroller {
    
    async register(req, res, next) {
        try {
            
            const data = req.body
            const result = await authService.register(data)
            
            res.json({
                success: true,
                message: "berhasi; register",
                data: result
            })
            
            
        } catch(e) {
            next(e)
        }
       
    }
    
    async login(req, res, next) {
        try {
            
            const data = req.body
            const result = await authService.login(data)
            
            res.json({
                success: true,
                message: "berhasi; login",
                data: result
            })
            
            
        } catch(e) {
            next(e)
        }
       
    }
    
    async profile(req, res, next) {
        try {
            
            const data = req.userid
            const result = await authService.profile(data)
            
            res.json({
                success: true,
                message: "berhasil mengambil profile",
                data: result
            })
            
            
        } catch(e) {
            next(e)
        }
       
    }
    
}

module.exports = new authCOntroller()