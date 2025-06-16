import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateReservationInput } from './dto/create-reservation.input';
import { UpdateReservationInput } from './dto/update-reservation.input';
import { Reservation } from './entities/reservation.entity';
import { BookingConflictException } from './exceptions/booking-conflict.exception';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createReservationInput: CreateReservationInput,
  ): Promise<Reservation> {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        // 1. Check for conflicts within the transaction
        const existingReservations = await transactionalEntityManager
          .createQueryBuilder(Reservation, 'reservation')
          .where('reservation.stadiumId = :stadiumId', {
            stadiumId: createReservationInput.stadiumId,
          })
          .andWhere('reservation.courtNumber = :courtNumber', {
            courtNumber: createReservationInput.courtNumber,
          })
          .andWhere('reservation.date = :date', {
            date: createReservationInput.date,
          })
          .andWhere('reservation.status != :cancelledStatus', {
            cancelledStatus: 'CANCELLED',
          })
          .andWhere(
            '(reservation.startTime < :endTime AND reservation.endTime > :startTime)',
            {
              startTime: createReservationInput.startTime,
              endTime: createReservationInput.endTime,
            },
          )
          .getMany();

        if (existingReservations.length > 0) {
          throw new BookingConflictException(
            'BOOKING_CONFLICT: This time slot is already booked',
          );
        }

        // 2. Create the reservation
        const reservation = transactionalEntityManager.create(Reservation, {
          userId: createReservationInput.userId,
          stadiumId: createReservationInput.stadiumId,
          sport: createReservationInput.sport,
          courtType: createReservationInput.courtType,
          courtNumber: createReservationInput.courtNumber,
          date: createReservationInput.date,
          startTime: createReservationInput.startTime,
          endTime: createReservationInput.endTime,
          totalPrice: createReservationInput.totalPrice,
          status: createReservationInput.status || 'pending',
        });

        const savedReservation = await transactionalEntityManager.save(
          Reservation,
          reservation,
        );

        // 3. Load the full reservation with relations
        const fullReservation = await transactionalEntityManager.findOne(
          Reservation,
          {
            where: { id: savedReservation.id },
            relations: ['user', 'user.avatar', 'stadium'],
          },
        );

        if (!fullReservation) {
          throw new NotFoundException(
            `Failed to retrieve created reservation with ID ${savedReservation.id}`,
          );
        }

        return fullReservation;
      },
    );
  }

  async findAll(): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      relations: ['user', 'user.avatar', 'stadium'],
    });
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'user.avatar', 'stadium'],
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return reservation;
  }

  async findByUserId(userId: number): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { userId },
      relations: ['user', 'user.avatar', 'stadium'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStadiumId(stadiumId: number): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { stadiumId },
      relations: ['user', 'user.avatar', 'stadium'],
      order: { createdAt: 'DESC' },
    });
  }

  async findStadiumReservations(
    stadiumId: number,
    date: string,
  ): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: {
        stadiumId,
        date,
      },
      relations: ['user', 'user.avatar', 'stadium'],
      order: { startTime: 'ASC' },
    });
  }

  async findOwnerStadiumReservationsByDateRange(
    ownerId: number,
    startDate: string,
    endDate: string,
  ): Promise<Reservation[]> {
    return await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .leftJoinAndSelect('reservation.stadium', 'stadium')
      .where('stadium.userId = :ownerId', { ownerId })
      .andWhere('reservation.date >= :startDate', { startDate })
      .andWhere('reservation.date <= :endDate', { endDate })
      .orderBy('reservation.date', 'DESC')
      .addOrderBy('reservation.startTime', 'ASC')
      .getMany();
  }

  async update(
    id: number,
    updateReservationInput: UpdateReservationInput,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id);
    Object.assign(reservation, updateReservationInput);
    return await this.reservationRepository.save(reservation);
  }

  async updateStatus(id: number, status: string): Promise<Reservation> {
    const reservation = await this.findOne(id);
    reservation.status = status;
    return await this.reservationRepository.save(reservation);
  }

  async remove(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);
    return await this.reservationRepository.remove(reservation);
  }
}
