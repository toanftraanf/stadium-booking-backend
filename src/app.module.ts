import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GqlModuleOptions, GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration } from './config';
import { UserModule } from './modules/user/user.module';
import { SportModule } from './modules/sport/sport.module';
import { AuthModule } from './modules/auth/auth.module';
import { StadiumModule } from './modules/stadium/stadium.module';
import { UploadModule } from './modules/upload/upload.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { FriendshipModule } from './modules/frientship/friendship.module';
import { ReviewModule } from './modules/review/review.module';

@Module({
  imports: [
    // Configuration
    // https://docs.nestjs.com/techniques/configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // Database
    // https://docs.nestjs.com/techniques/database
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        ...config.get<TypeOrmModuleOptions>('db'),
      }),
      inject: [ConfigService],
    }),
    // GraphQL
    // https://docs.nestjs.com/graphql/other-features
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      useFactory: (config: ConfigService) => ({
        ...config.get<GqlModuleOptions>('graphql'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    FriendshipModule,
    SportModule,
    AuthModule,
    StadiumModule,
    UploadModule,
    ReservationModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
