import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdToStadium1739332319000 implements MigrationInterface {
    name = 'AddUserIdToStadium1739332319000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First add the column as nullable
        await queryRunner.query(`ALTER TABLE "stadiums" ADD "userId" integer NULL`);
        
        // Update existing records with a default user ID (you may want to change this ID)
        await queryRunner.query(`UPDATE "stadiums" SET "userId" = 1 WHERE "userId" IS NULL`);
        
        // Now make the column non-nullable
        await queryRunner.query(`ALTER TABLE "stadiums" ALTER COLUMN "userId" SET NOT NULL`);
        
        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "stadiums" ADD CONSTRAINT "FK_stadiums_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraint
        await queryRunner.query(`ALTER TABLE "stadiums" DROP CONSTRAINT "FK_stadiums_user"`);
        
        // Remove the column
        await queryRunner.query(`ALTER TABLE "stadiums" DROP COLUMN "userId"`);
    }
} 