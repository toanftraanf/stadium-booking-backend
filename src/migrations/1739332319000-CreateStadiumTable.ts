import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStadiumTable1739332319000 implements MigrationInterface {
    name = 'CreateStadiumTable1739332319000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stadium" (
            "id" SERIAL NOT NULL,
            "name" character varying NOT NULL,
            "description" character varying NOT NULL,
            "address" character varying NOT NULL,
            "googleMap" character varying NOT NULL,
            "phone" character varying NOT NULL,
            "email" character varying NOT NULL,
            "website" character varying NOT NULL,
            "otherContacts" text array NOT NULL,
            "startTime" character varying NOT NULL,
            "endTime" character varying NOT NULL,
            "otherInfo" character varying NOT NULL,
            "sports" text array NOT NULL,
            "price" decimal(10,2) NOT NULL,
            "area" decimal(10,2) NOT NULL,
            "numberOfFields" integer NOT NULL,
            "rating" decimal(3,2) NOT NULL DEFAULT '0',
            "status" character varying NOT NULL DEFAULT 'active',
            "images" text array NOT NULL DEFAULT '{}',
            "userId" integer NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_stadium" PRIMARY KEY ("id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "stadium"`);
    }
} 