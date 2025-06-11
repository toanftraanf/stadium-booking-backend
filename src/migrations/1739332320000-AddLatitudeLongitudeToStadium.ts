import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLatitudeLongitudeToStadium1739332320000
  implements MigrationInterface
{
  name = 'AddLatitudeLongitudeToStadium1739332320000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if columns exist before adding them
    const table = await queryRunner.getTable('stadiums');
    if (!table) {
      throw new Error("Table 'stadiums' not found");
    }

    if (!table.findColumnByName('latitude')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" ADD "latitude" decimal(10,8)`,
      );
    }

    if (!table.findColumnByName('longitude')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" ADD "longitude" decimal(11,8)`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('stadiums');
    if (!table) {
      throw new Error("Table 'stadiums' not found");
    }

    if (table.findColumnByName('longitude')) {
      await queryRunner.query(`ALTER TABLE "stadiums" DROP COLUMN "longitude"`);
    }

    if (table.findColumnByName('latitude')) {
      await queryRunner.query(`ALTER TABLE "stadiums" DROP COLUMN "latitude"`);
    }
  }
}
