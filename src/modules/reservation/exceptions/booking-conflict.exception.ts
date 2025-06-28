import { ConflictException } from '@nestjs/common';
import { BookingErrorCode } from '../enums/booking-error-code.enum';

export class BookingConflictException extends ConflictException {
  public readonly errorCode = BookingErrorCode.BOOKING_CONFLICT;

  constructor(message?: string) {
    super(message || 'BOOKING_CONFLICT: This time slot is already booked');
  }
}
