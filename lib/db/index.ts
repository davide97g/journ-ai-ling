import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Create postgres client
const client = postgres(process.env.POSTGRES_URL!, { prepare: false })

// Create drizzle instance
export const db = drizzle(client, { schema })
