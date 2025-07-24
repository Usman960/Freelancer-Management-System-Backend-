const userRepo = require("../repositories/userRepo")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const helpers = require("../utils/helper")
const dotenv = require("dotenv")
dotenv.config()

exports.signUp = async (body) => {
    const { email, password, utype, ...userData } = body;
    const user = await userRepo.getUser(email)

    if (user)
        throw new Error("User already exists")

    if (utype !== 'Freelancer' && utype !== 'Seller') {
        throw new Error("Invalid user type")
    }

    const hashedPassword = await bcrypt.hash(password, 5);
    const newUser = await userRepo.addUser({
        email,
        password: hashedPassword,
        utype,
        ...userData
    });

    const admins = await userRepo.getAdmins();
    const notificationMsg = `Request to add user ${newUser._id}`;

    for (const admin of admins) {
        await userRepo.accountApprovalNotification(admin._id, notificationMsg)
    }

    return {
        message: `${utype.toUpperCase()} account pending approval`
    }
}

exports.login = async(body) => {
    const { email, password } = body

    const user = await userRepo.getUser(email)
    if (!user || user.isDeleted)
        throw new Error("User not found")

    if (!user.isActive)
        throw new Error("Account is inactive")
    
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck)
        throw new Error("Invalid password")

    const token = jwt.sign({
        email,
        createdAt: new Date(),
        userId:user._id,
        utype: user.utype,
    }, "MY_SECRET", { expiresIn: "1d" });

    return {
        message: "Login successful",
        token: token
    }
}

exports.changePassword = async(req) => {
    const token = req.headers.authorization;
    if (!token)
        throw new Error("Token not found")

    const user = jwt.verify(token.split(" ")[1], "MY_SECRET");
    const { password, confirmPassword } = req.body;

    if (password != confirmPassword)
        throw new Error("Password mismatch")
    
    const email = user.email;
    const hashedPassword = await bcrypt.hash(password, 5)
    await userRepo.updatePassword(email, hashedPassword)
    
    return {
        message: "Password changed successfully"
    };
}

exports.forgetPassword = async(body) => {
    const { email } = body
    const user = await userRepo.getUser(email)

    if (!user)
        throw new Error("Invalid email address")
        
    const newPassword = helpers.generateAlphanumericPassword();
    await user.updateOne({ password: await bcrypt.hash(newPassword, 5) })
    await helpers.transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Password Reset",
        text: `Dear ${user.fullName}, your new password is: ${newPassword}`
    });
    return {
        message: "Check your email for new password"
    }
}