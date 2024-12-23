import { config } from "dotenv";
import path from "path";

const envFile = `.env.${process.env.NODE_ENV || "production"}`;
config({ path: path.resolve(process.cwd(), envFile) });

console.log(`Environment loaded: ${envFile}`);
