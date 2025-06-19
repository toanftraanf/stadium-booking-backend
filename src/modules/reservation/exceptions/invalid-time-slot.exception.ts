import { BadRequestException } from '@nestjs/common';
import { BookingErrorCode } from '../enums/booking-error-code.enum';

export class InvalidTimeSlotException extends BadRequestException {
  public readonly errorCode = BookingErrorCode.INVALID_TIME_SLOT;

  constructor(message?: string) {
    super(message || 'Invalid time slot provided');
  }
}
