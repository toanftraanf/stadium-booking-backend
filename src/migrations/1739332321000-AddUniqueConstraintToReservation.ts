import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToReservation1739332321000
  implements MigrationInterface
{
  name = 'AddUniqueConstraintToReservation1739332321000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, identify and handle duplicate reservations
    // Keep the first occurrence of each duplicate group and mark others as CANCELLED
    await queryRunner.query(`
      UPDATE reservations 
      SET status = 'CANCELLED' 
      WHERE id NOT IN (
        SELECT DISTINCT ON ("stadiumId", "courtNumber", "date", "startTime", "endTime") id
        FROM reservations 
        WHERE status != 'CANCELLED'
        ORDER BY "stadiumId", "courtNumber", "date", "startTime", "endTime", "createdAt" ASC
      ) AND status != 'CANCELLED'
    `);

    // Add unique partial index (PostgreSQL supports WHERE clause in unique constraints)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "unique_reservation_slot" ON "reservations" ("stadiumId", "courtNumber", "date", "startTime", "endTime") WHERE "status" != 'CANCELLED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique index
    await queryRunner.query(`DROP INDEX IF EXISTS "unique_reservation_slot"`);

    // Note: We don't revert the status changes as they represent a data cleanup
    // that should be maintained for data integrity
  }
}
