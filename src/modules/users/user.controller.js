const userService = require('../users/user.service')
const NotFound = require('../../error/NotfoundError')
const { success } = require('zod/v4')

class UserController {
    async getAll(req, res, next) {
        try {
            const users = await userService.getAll();
            if(users.length === 0) throw new NotFound("User tidak di temukan")
            res.json({
                "success": true,
                "message": `successfully user berhasil di temukan total ${users.length}`,
                "data": users
            })
        } catch(e) {
            next(e)
            
        }
    }
    
    async getAllById(req, res, next) {
        try {
            const users = await userService.getByID(req.params.id)
            if(!users) throw new NotFound("user tidak di temukan")
            res.json({
                "success": true,
                "message": "successfully user berhasil di temukan",
                "data": users
        })
        } catch(e) {
            next(e)
        }
    }
    
    async create(req, res, next) {
        try{
            const user = await userService.create(req.body)
            if(!user) throw new NotFound("user tidak di temukan")
            res.json({
                "success": true,
                "message": "berhasil mencreate user baru",
                "data": user
        })
        } catch(e) {
            next(e)
        }
    }
    
    async update(req, res, next) {
        try{
            const user = await userService.update(req.params.id, req.body)
            if(!user) throw new NotFound("user tidak di temukan")
            res.json({
                "success": true,
                "message": "berhasil update user",
                "data": user
        })
        } catch(e) {
            next(e)
        }
    }
    
    async delete(req, res, next) {
        try{
            const user = await userService.delete(req.params.id)
            if(!user) throw new NotFound("user tidak di temukan")
            res.json({
                "success": true,
                "message": "berhasil delete user",
                "data": user
        })
        } catch(e) {
            next(e)
        }
    }

}

module.exports = new UserController()