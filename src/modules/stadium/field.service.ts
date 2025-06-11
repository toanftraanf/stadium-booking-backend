import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFieldInput } from './dto/create-field.input';
import { UpdateFieldInput } from './dto/update-field.input';
import { StadiumField } from './entities/field.entity';

@Injectable()
export class FieldService {
  constructor(
    @InjectRepository(StadiumField)
    private readonly fieldRepository: Repository<StadiumField>,
  ) {}

  async create(createFieldInput: CreateFieldInput): Promise<StadiumField> {
    const field = this.fieldRepository.create(createFieldInput);
    return await this.fieldRepository.save(field);
  }

  async createMultiple(
    stadiumId: number,
    fieldNames: string[],
  ): Promise<StadiumField[]> {
    const fields = fieldNames.map((fieldName) =>
      this.fieldRepository.create({ fieldName, stadiumId }),
    );
    return await this.fieldRepository.save(fields);
  }

  async findAll(): Promise<StadiumField[]> {
    return await this.fieldRepository.find({
      relations: ['stadium'],
    });
  }

  async findOne(id: number): Promise<StadiumField> {
    const field = await this.fieldRepository.findOne({
      where: { id },
      relations: ['stadium'],
    });
    if (!field) {
      throw new NotFoundException(`Field with ID ${id} not found`);
    }
    return field;
  }

  async findByStadiumId(stadiumId: number): Promise<StadiumField[]> {
    return await this.fieldRepository.find({
      where: { stadiumId },
      relations: ['stadium'],
      order: { fieldName: 'ASC' },
    });
  }

  async update(
    id: number,
    updateFieldInput: UpdateFieldInput,
  ): Promise<StadiumField> {
    const field = await this.findOne(id);
    Object.assign(field, updateFieldInput);
    return await this.fieldRepository.save(field);
  }

  async remove(id: number): Promise<StadiumField> {
    const field = await this.findOne(id);
    return await this.fieldRepository.remove(field);
  }

  async removeByStadiumId(stadiumId: number): Promise<void> {
    await this.fieldRepository.delete({ stadiumId });
  }
}
