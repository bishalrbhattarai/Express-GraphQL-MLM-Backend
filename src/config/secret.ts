import dotenv from "dotenv"
dotenv.config()

export const secret = {
    SMTP_HOST:process.env.SMTP_HOST!,
    SMTP_PORT:process.env.SMTP_PORT!,
    SMTP_MAIL:process.env.SMTP_MAIL!,
    SMTP_PASSWORD:process.env.SMTP_PASSWORD!,
    SECRET_KEY:process.env.SECRET_KEY!,
    JWT_LOGIN_SECRET:process.env.JWT_LOGIN_SECRET!,

}