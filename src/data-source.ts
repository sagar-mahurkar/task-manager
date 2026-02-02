import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "0.0.0.0",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "task_manager",
    synchronize: true,
    logging: false,
    entities: [],
    subscribers: [],
    migrations: [],
})
