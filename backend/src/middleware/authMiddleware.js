import { clerkClient } from "@clerk/express";


export const protectRoute = async (req, res, next) => {
    if (!req.auth.userId) {
        res.status(401).json({ success: false, message: "Unauthorized - you must be logged in" })
        return
    }
    next()
}

export const requireAdmin = async (req, res, next) => {
    try {
        if (!req.auth.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const currentUser = await clerkClient.users.getUser(req.auth.userId);
        const userEmail = currentUser.emailAddresses.find(
            email => email.id === currentUser.primaryEmailAddressId
        )?.emailAddress;

        const isAdmin = process.env.ADMIN_EMAIL === userEmail;

        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Forbidden - admin access required"
            });
        }

        next();
    } catch (err) {
        console.error("Admin check error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error during admin verification"
        });
    }
}