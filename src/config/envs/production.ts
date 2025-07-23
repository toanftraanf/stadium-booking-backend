export const config = {
  db: {
    type: process.env.DB_TYPE || 'mysql',
    synchronize: false,
    logging: false,
    replication: {
      master: {
        host: process.env.DB_HOST || 'sportnow.postgres.database.azure.com',
        port: process.env.DB_PORT || 5432,
        username: process.env.DB_USER || 'duy',
        password: process.env.DB_PASSWORD || 'Duyhbxm123123.',
        database: process.env.DB_NAME || 'stadium_booking',
        ssl: { rejectUnauthorized: false },
      },
      slaves: [
        {
         host: process.env.DB_HOST || 'sportnow.postgres.database.azure.com',
        port: process.env.DB_PORT || 5432,
        username: process.env.DB_USER || 'duy',
        password: process.env.DB_PASSWORD || 'Duyhbxm123123.',
        database: process.env.DB_NAME || 'stadium_booking',
        ssl: { rejectUnauthorized: false },
        },
      ],
    },
    extra: {
      connectionLimit: 30,
    },
    autoLoadEntities: true,
  },
  graphql: {
    debug: false,
    playground: false,
  },
  foo: 'pro-bar',
};
