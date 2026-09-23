import dotenv from "dotenv";
import { setupDb } from "../db/sequelize";
import { app } from "./express";

dotenv.config();
const port: number = Number(process.env.PORT) || 3000;

setupDb(process.env.DB_STORAGE || ":memory:").then(() => {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
});
