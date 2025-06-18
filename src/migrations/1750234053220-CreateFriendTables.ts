import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFriendTables1750234053220 implements MigrationInterface {
    name = 'CreateFriendTables1750234053220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."friend_requests_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "friend_requests" ("id" BIGSERIAL NOT NULL, "status" "public"."friend_requests_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "requesterId" integer, "recipientId" integer, CONSTRAINT "PK_3827ba86ce64ecb4b90c92eeea6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_friend_requests_recipient" ON "friend_requests" ("recipientId", "status") `);
        await queryRunner.query(`CREATE TABLE "friendships" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userOneId" integer, "userTwoId" integer, CONSTRAINT "UQ_friendship_pair" UNIQUE ("userOneId", "userTwoId"), CONSTRAINT "PK_08af97d0be72942681757f07bc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "friend_requests" ADD CONSTRAINT "FK_0a91c26699cf7e177f9c5b5beb4" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend_requests" ADD CONSTRAINT "FK_b7d86ccee3c96b290cab3cbe3f1" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendships" ADD CONSTRAINT "FK_7a86c244e9204d5a115b5367892" FOREIGN KEY ("userOneId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendships" ADD CONSTRAINT "FK_9bd886f2c20c14318617530272c" FOREIGN KEY ("userTwoId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friendships" DROP CONSTRAINT "FK_9bd886f2c20c14318617530272c"`);
        await queryRunner.query(`ALTER TABLE "friendships" DROP CONSTRAINT "FK_7a86c244e9204d5a115b5367892"`);
        await queryRunner.query(`ALTER TABLE "friend_requests" DROP CONSTRAINT "FK_b7d86ccee3c96b290cab3cbe3f1"`);
        await queryRunner.query(`ALTER TABLE "friend_requests" DROP CONSTRAINT "FK_0a91c26699cf7e177f9c5b5beb4"`);
        await queryRunner.query(`DROP TABLE "friendships"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_friend_requests_recipient"`);
        await queryRunner.query(`DROP TABLE "friend_requests"`);
        await queryRunner.query(`DROP TYPE "public"."friend_requests_status_enum"`);
    }

}
