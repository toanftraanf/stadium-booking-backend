import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReservationInput } from './dto/create-reservation.input';
import { UpdateReservationInput } from './dto/update-reservation.input';
import { Reservation } from './entities/reservation.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async create(
    createReservationInput: CreateReservationInput,
  ): Promise<Reservation> {
    const reservation = this.reservationRepository.create(
      createReservationInput,
    );
    const savedReservation = await this.reservationRepository.save(reservation);

    // Load the full reservation with relations
    return await this.findOne(savedReservation.id);
  }

  async findAll(): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      relations: ['user', 'stadium'],
    });
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'stadium'],
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return reservation;
  }

  async findByUserId(userId: number): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { userId },
      relations: ['user', 'stadium'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStadiumId(stadiumId: number): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { stadiumId },
      relations: ['user', 'stadium'],
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
      relations: ['user', 'stadium'],
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
