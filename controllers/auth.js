const authService = require("../services/authService")

exports.signUp = async (req, res) => {
    try {
        const result = await authService.signUp(req.body)
        res.status(201).json(result)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

exports.login = async (req, res) => {
    try {
        const result = await authService.login(req.body)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

exports.changePassword = async (req, res) => {
    try {
        const result = await authService.changePassword(req)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

exports.forgetPassword = async (req,res) => {
    try {
        const result = await authService.forgetPassword(req.body)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}