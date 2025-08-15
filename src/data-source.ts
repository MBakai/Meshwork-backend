import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: true, // Habilita SSL
  extra: {
    ssl: {
      rejectUnauthorized: false, // Solo si usas un certificado auto-firmado (común en Render)
    },
  },
  entities: [__dirname + "/**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  synchronize: false,
});

