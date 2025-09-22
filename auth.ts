import { betterAuth } from "better-auth";
import { MssqlDialect } from "kysely";
import * as Tedious from 'tedious'
import * as Tarn from 'tarn'
import { jwt } from "better-auth/plugins"
 
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
        database: 'ai-prompt',
        port: 1433,
        trustServerCertificate: true,
      },
      server: 'ai-prompt.database.windows.net',
    }),
  },
})

export const auth = betterAuth({
    plugins: [jwt({
      jwks: {
        keyPairConfig: {
          alg: 'ES256',
        }
      }
    })],
    database: {
        dialect,
        type: "mssql"
    },
    socialProviders: {
        microsoft: {
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID as string,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET as string
        }
    }
})