import { user } from "../models/user-model.js"

export const callback = async (req, res, next) => {
    console.log("Auth Callback called")
    try {
        const { id, firstName, lastName, imageUrl } = req.body
        const existingUser = await user.findOne({ clerkId: id })

        if (!existingUser) {
            await user.create({
                clerkId: id,
                fullName: `${firstName} ${lastName}`,
                imageUrl
            })
        }
        res.status(200).json({ success: true, message: "User created successfully" })
    }
    catch (err) {
        console.log(err)
        next(err)
    }
}