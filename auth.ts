import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
 
export const auth = betterAuth({
    database: new Database("./sqlite.db"),
    socialProviders: {
        microsoft: {
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID as string,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET as string
        }
    }, 
})