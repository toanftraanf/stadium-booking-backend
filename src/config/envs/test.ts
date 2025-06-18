// export * from './development';
export const config = {
  db: {
    type: 'postgres',
    synchronize: false,
    logging: false,
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123',
    database: process.env.DB_NAME || 'stadium_booking',
    extra: {
      connectionLimit: 5,
    },
    autoLoadEntities: true,
  },
  graphql: {
    playground: false,
  },
};
