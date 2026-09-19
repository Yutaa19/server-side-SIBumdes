const db = require('../../store/sequelize')
const User = db.user
const BadrequestError = require('../../error/BadrequestError')
const bcrypt = require('bcrypt')
const ServerError = require('../../error/ServerError')
const NotFound = require('../../error/NotfoundError')

class userService {
    constructor() {
        this.SALT_ROUND = 10
    }
    
    async getAll() {
        return await User.findAll({attributes: {'exclude': ['password']}})
    }
    
    async getByID(id) {
        return await User.findByPk(id, {attributes: {'exclude': ['password']}})
    }
    
    async create(data) {
        const existingUser = await User.findOne({
            where: {email: data.email}
        })
        
        if(existingUser) {
            throw new BadrequestError("Email Sudah Terdaftar")
        }
        
        const hash = await bcrypt.hash(data.password, this.SALT_ROUND)
        const newUser = await User.create({...data, password: hash})
        const userJson = await newUser.toJSON();
        delete userJson.password
        
        return userJson
        
    }
    
    async update(id, data) {
        
        const user = await User.findByPk(id)
        if(!user) {
            throw new NotFound("User Tidak DI temukan")
        }
        
        if(data.email && data.email !== user.email) {
            const existingUser = await User.findOne({
                where: {email: data.email}
            })
            if(existingUser) {
                throw new BadrequestError("Email Sudah terdaftar")
            }
        }
        
        if(data.password) {
            data.password = await bcrypt.hash(data.password, this.SALT_ROUND)
        }
        
        try {
            await User.update(data, {
                where: {id:id},
                validate: true
            })
        } catch(err) {
            console.error("error", err);
            const message = err.errors?.map(e => e.message) || [err.message];
            throw new ServerError("gagal update user: " + message.join(', '));
        }
        
        const updatedUser = await User.findByPk(id, {attributes: {'exclude': ['password']}})
        return updatedUser ? updatedUser.toJSON() : null
    }
    
    async delete(id) {
        const user = await User.findByPk(id)
        if(!user) return null
        await user.destroy()
        return true
    }
    
}

module.exports = new userService();