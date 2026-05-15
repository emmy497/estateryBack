import  { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"



interface JwtPayload {
    id: string;
    role: string;
}


export interface AuthRequest extends Request {
    user?: JwtPayload;
}


export const Protect = (req: AuthRequest, res:Response, next: NextFunction) => {
    let token = req.headers.authorization;

    if(!token) {
        return res.status(401).json({message: "Not authorized"});
    }

    try {
        token = token.split(" ")[1]; 

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string,) as JwtPayload;

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({message: "Token failed"});
    }

}


export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if(req.user?.role !== "admin") {
        return res.status(403).json({message: "Admin only"});
    }
    next();
};