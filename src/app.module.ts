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
import { FriendshipModule } from './modules/friendship/friendship.module';
import { MatchingModule } from './modules/matching/matching.module';
import { ReviewModule } from './modules/review/review.module';
import { EventModule } from './modules/event/event.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { UserSubscriptionModule } from './modules/user-subscription/user-subscription.module';
import { PaymentMethodModule } from './modules/payment-method/payment-method.module';

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
    MatchingModule,
    SportModule,
    AuthModule,
    StadiumModule,
    UploadModule,
    ReservationModule,
    ReviewModule,
    EventModule,
    SubscriptionModule,
    UserSubscriptionModule,
    PaymentMethodModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
