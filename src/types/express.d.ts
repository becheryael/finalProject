import { UserType } from "../models/user";

declare global {
    declare namespace Express {
        export interface Request {
            user?: UserType,
            token?: string
        }
    }
}