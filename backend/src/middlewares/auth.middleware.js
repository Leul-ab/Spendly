import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(401).json({message: "no token provided"});
        }

        const token = authHeader.split(" ")[1];

        if(!token){
            return res.status(401).json({message: "invalid token format"});
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({message: "unauthorized"});
    }
};