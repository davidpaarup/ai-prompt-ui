import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { MssqlDialect, Kysely } from "kysely";
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
        database: 'ai-prompt',
        port: 1433,
        trustServerCertificate: true,
      },
      server: 'ai-prompt.database.windows.net',
    }),
  },
})

interface Database {
  user_api_tokens: {
    id: string;
    user_id: string;
    api_token: string;
    created_at: Date;
    updated_at: Date;
  };
}

const db = new Kysely<Database>({ dialect });

function maskToken(token: string): string {
  if (!token || token.length <= 8) {
    return '••••••••';
  }
  const start = token.substring(0, 4);
  const end = token.substring(token.length - 4);
  return `${start}••••••••••••${end}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userToken = await db
      .selectFrom('user_api_tokens')
      .select(['api_token', 'created_at', 'updated_at'])
      .where('user_id', '=', session.user.id)
      .executeTakeFirst();

    if (!userToken) {
      return Response.json({ 
        hasToken: false,
        maskedToken: null 
      });
    }

    return Response.json({ 
      hasToken: true,
      maskedToken: maskToken(userToken.api_token),
      createdAt: userToken.created_at,
      updatedAt: userToken.updated_at
    });
  } catch (error) {
    console.error("Error fetching API token:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { apiToken } = body;

    if (!apiToken || typeof apiToken !== 'string') {
      return Response.json({ error: "API token is required" }, { status: 400 });
    }

    // Save or update the API token in the database

   const existing = await db
      .selectFrom('user_api_tokens')
      .select('id')
      .where('user_id', '=', session.user.id)
      .executeTakeFirst();


    if (existing) {
      await db
        .updateTable('user_api_tokens')
        .set({
          api_token: apiToken,
          updated_at: new Date(),
        })
        .where('user_id', '=', session.user.id)
        .execute();
    } else {
      await db
        .insertInto('user_api_tokens')
        .values({
          id: crypto.randomUUID(),
          user_id: session.user.id,
          api_token: apiToken,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .execute();
      }

    return Response.json({ 
      success: true,
      message: "API token saved successfully" 
    });
  } catch (error) {
    console.error("Error saving API token:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}