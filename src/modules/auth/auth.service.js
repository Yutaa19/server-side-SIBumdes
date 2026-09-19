
const db = require('../../store/sequelize')
const User = db.user
const bcrypt = require('bcrypt')
const BadRequestError = require('../../error/BadrequestError')
const NotFoundError = require('../../error/NotfoundError')
const jwt = require('../auth/jwtService')


class authService {
    constructor() {
        this.SALT_ROUND = 10
    }
    
    async register({name, email, password, number, role, unit_usaha}) {
        const existingUser = await User.findOne({
            where: { email }
        })
        
        if(existingUser) throw new BadRequestError("email sudah terdaftar")
        
        const hash = await bcrypt.hash(password, this.SALT_ROUND)
        const newUser = await User.create({
            name, email, password: hash, number, role, unit_usaha
        })
        const token = jwt.sign({id: newUser.id, email: newUser.email})
        const userJson = newUser.toJSON()
        delete userJson.password
        
        return { user: userJson, token}
    }
    
    async login({email, password}) {
        const user = await User.findOne({
            where: { email }
        })
        
        if(!user) throw new NotFoundError("Email Tidak Terdaftar")
        
        const compare = await bcrypt.compare(password, user.password)
        if(!compare) throw new BadRequestError("password yang di masukan salah")
        
        const token = jwt.sign({id: user.id, email: user.email})
        const userJson = user.toJSON()
        delete userJson.password
        
        return {user: userJson, token}
    }
    
    async profile(userid) {
        return await User.findByPk(userid)
    }
    
}

module.exports = new authService()