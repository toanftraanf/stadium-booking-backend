import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewTable1739332322000 implements MigrationInterface {
  name = 'CreateReviewTable1739332322000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if reviews table exists
    const table = await queryRunner.getTable('reviews');

    if (!table) {
      // Create reviews table
      await queryRunner.query(`
        CREATE TABLE "reviews" (
          "id" SERIAL NOT NULL,
          "reservationId" integer NOT NULL,
          "stadiumId" integer NOT NULL,
          "userId" integer NOT NULL,
          "rating" integer NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
          "comment" text NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_reviews" PRIMARY KEY ("id")
        )
      `);
    }

    // Check if reviews table exists for constraints
    const reviewsTable = await queryRunner.getTable('reviews');

    if (reviewsTable) {
      // Add foreign key constraints if they don't exist
      const hasReservationFK = reviewsTable.foreignKeys.some((fk) =>
        fk.columnNames.includes('reservationId'),
      );
      if (!hasReservationFK) {
        await queryRunner.query(`
          ALTER TABLE "reviews" 
          ADD CONSTRAINT "FK_reviews_reservationId" 
          FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") 
          ON DELETE CASCADE ON UPDATE NO ACTION
        `);
      }

      const hasStadiumFK = reviewsTable.foreignKeys.some((fk) =>
        fk.columnNames.includes('stadiumId'),
      );
      if (!hasStadiumFK) {
        await queryRunner.query(`
          ALTER TABLE "reviews" 
          ADD CONSTRAINT "FK_reviews_stadiumId" 
          FOREIGN KEY ("stadiumId") REFERENCES "stadiums"("id") 
          ON DELETE CASCADE ON UPDATE NO ACTION
        `);
      }

      const hasUserFK = reviewsTable.foreignKeys.some((fk) =>
        fk.columnNames.includes('userId'),
      );
      if (!hasUserFK) {
        await queryRunner.query(`
          ALTER TABLE "reviews" 
          ADD CONSTRAINT "FK_reviews_userId" 
          FOREIGN KEY ("userId") REFERENCES "users"("id") 
          ON DELETE CASCADE ON UPDATE NO ACTION
        `);
      }

      // Add unique constraint if it doesn't exist
      const hasUniqueConstraint = reviewsTable.uniques.some((unique) =>
        unique.columnNames.includes('reservationId'),
      );
      if (!hasUniqueConstraint) {
        await queryRunner.query(`
          ALTER TABLE "reviews" 
          ADD CONSTRAINT "UQ_reviews_reservationId" 
          UNIQUE ("reservationId")
        `);
      }

      // Create indexes if they don't exist (PostgreSQL will ignore if they exist)
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "IDX_reviews_stadiumId" ON "reviews" ("stadiumId")
      `);

      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "IDX_reviews_userId" ON "reviews" ("userId")
      `);

      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "IDX_reviews_rating" ON "reviews" ("rating")
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reviews_rating"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reviews_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reviews_stadiumId"`);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "FK_reviews_userId"
    `);
    await queryRunner.query(`
      ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "FK_reviews_stadiumId"
    `);
    await queryRunner.query(`
      ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "FK_reviews_reservationId"
    `);

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "UQ_reviews_reservationId"
    `);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`);
  }
}
