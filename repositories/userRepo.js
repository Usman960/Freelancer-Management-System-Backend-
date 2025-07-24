const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.getUser = async (email) => {
    return await User.findOne({email: email})
}

exports.addUser = async(userData) => {
    const user = new User(userData)
    return await user.save()
}

exports.getAdmins = async () => {
    return await User.find({ utype: { $in: ["Super Admin", "Admin"] } })
}

exports.accountApprovalNotification = async(adminId, notificationMsg) => {
    await User.findByIdAndUpdate(adminId, {
        $push: { notifications: { message: notificationMsg } }
    });
}

exports.updatePassword = async (email, password) => {
    await User.findOneAndUpdate({ email }, { password });
}