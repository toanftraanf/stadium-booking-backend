import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToStadium1739332319000 implements MigrationInterface {
  name = 'AddUserIdToStadium1739332319000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists and if column exists before adding
    const table = await queryRunner.getTable('stadiums');
    if (table && !table.findColumnByName('userId')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" ADD "userId" integer NULL`,
      );
    }

    // Add foreign key constraint if it doesn't exist
    const hasUserIdConstraint = table?.foreignKeys.some((fk) =>
      fk.columnNames.includes('userId'),
    );
    if (table && table.findColumnByName('userId') && !hasUserIdConstraint) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" ADD CONSTRAINT "FK_stadiums_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint first
    const table = await queryRunner.getTable('stadiums');
    const hasUserIdConstraint = table?.foreignKeys.some((fk) =>
      fk.columnNames.includes('userId'),
    );
    if (hasUserIdConstraint) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" DROP CONSTRAINT "FK_stadiums_userId"`,
      );
    }

    // Drop column if it exists
    if (table && table.findColumnByName('userId')) {
      await queryRunner.query(`ALTER TABLE "stadiums" DROP COLUMN "userId"`);
    }
  }
}
