import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewFieldsToStadium1739332319003 implements MigrationInterface {
  name = 'AddNewFieldsToStadium1739332319003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if columns exist before adding them
    const table = await queryRunner.getTable('stadiums');
    if (!table) {
      throw new Error("Table 'stadiums' not found");
    }

    if (!table.findColumnByName('bank')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" ADD "bank" character varying`,
      );
    }

    if (!table.findColumnByName('accountName')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" ADD "accountName" character varying`,
      );
    }

    if (!table.findColumnByName('accountNumber')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" ADD "accountNumber" character varying`,
      );
    }

    if (!table.findColumnByName('otherPayments')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" ADD "otherPayments" text array`,
      );
    }

    if (!table.findColumnByName('pricingImages')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" ADD "pricingImages" text array`,
      );
    }

    if (!table.findColumnByName('avatarUrl')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" ADD "avatarUrl" character varying`,
      );
    }

    if (!table.findColumnByName('bannerUrl')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" ADD "bannerUrl" character varying`,
      );
    }

    if (!table.findColumnByName('galleryUrls')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" ADD "galleryUrls" text array`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('stadiums');
    if (!table) {
      throw new Error("Table 'stadiums' not found");
    }

    if (table.findColumnByName('galleryUrls')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" DROP COLUMN "galleryUrls"`,
      );
    }

    if (table.findColumnByName('bannerUrl')) {
      await queryRunner.query(`ALTER TABLE "stadiums" DROP COLUMN "bannerUrl"`);
    }

    if (table.findColumnByName('avatarUrl')) {
      await queryRunner.query(`ALTER TABLE "stadiums" DROP COLUMN "avatarUrl"`);
    }

    if (table.findColumnByName('pricingImages')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" DROP COLUMN "pricingImages"`,
      );
    }

    if (table.findColumnByName('otherPayments')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" DROP COLUMN "otherPayments"`,
      );
    }

    if (table.findColumnByName('accountNumber')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" DROP COLUMN "accountNumber"`,
      );
    }

    if (table.findColumnByName('accountName')) {
      await queryRunner.query(
        `ALTER TABLE "stadiums" DROP COLUMN "accountName"`,
      );
    }

    if (table.findColumnByName('bank')) {
      await queryRunner.query(`ALTER TABLE "stadiums" DROP COLUMN "bank"`);
    }
  }
}
