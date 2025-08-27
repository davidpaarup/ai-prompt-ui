import { betterAuth } from "better-auth";
import { MssqlDialect } from "kysely";
import * as Tedious from 'tedious'
import * as Tarn from 'tarn'
 
const dialect = new MssqlDialect({
  tarn: {
    ...Tarn,
    options: {
      min: 0,
      max: 10,
    },
  },
  tedious: {
    ...Tedious,
    connectionFactory: () => new Tedious.Connection({
      authentication: {
        options: {
          password: process.env.DATABASE_PASSWORD,
          userName: process.env.DATABASE_USERNAME,
        },
        type: 'default',
      },
      options: {
        database: 'ia-prompt',
        port: 1433,
        trustServerCertificate: true,
      },
      server: 'ia-prompt.database.windows.net',
    }),
  },
})

export const auth = betterAuth({
    database: {
        dialect,
        type: "mssql"
    },
    socialProviders: {
        microsoft: {
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID as string,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET as string
        }
    }, 
})