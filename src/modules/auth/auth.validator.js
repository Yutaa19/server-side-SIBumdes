const {body} = require('express-validator')

const registerValidator = [
    body('name')
    .notEmpty().withMessage("nama Wajib Di isi")
    .isLength({ max: 255}).withMessage("Panjang nama maksimal 255 character"),
    body("email")
    .notEmpty().withMessage("email wajib Di isi")
    .isEmail().withMessage("email tidak valid"),
    body("password")
    .notEmpty().withMessage("Password wajib di isi")
    .isLength({ min: 6}).withMessage("Maksimal password 6 character"),
    body("number")
    .optional()
    .isMobilePhone('id-ID').withMessage('Nomor telepon tidak valid')
]

const loginValidator = [
    body('email')
    .notEmpty().withMessage("Email wajib di isi")
    .isEmail().withMessage("Email tidak valid"),
    
    body("password")
    .notEmpty().withMessage("Password wajib di isi")
    .isLength({ min: 6}).withMessage("Maksimal password 6 character")
]

module.exports = {
    registerValidator,
    loginValidator
}