import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateFieldInput } from './dto/create-field.input';
import { UpdateFieldInput } from './dto/update-field.input';
import { StadiumField } from './entities/field.entity';
import { FieldService } from './field.service';

@Resolver(() => StadiumField)
export class FieldResolver {
  constructor(private readonly fieldService: FieldService) {}

  @Mutation(() => StadiumField)
  createField(@Args('createFieldInput') createFieldInput: CreateFieldInput) {
    return this.fieldService.create(createFieldInput);
  }

  @Query(() => [StadiumField], { name: 'fields' })
  findAll() {
    return this.fieldService.findAll();
  }

  @Query(() => StadiumField, { name: 'field' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.fieldService.findOne(id);
  }

  @Query(() => [StadiumField], { name: 'fieldsByStadium' })
  findByStadiumId(@Args('stadiumId', { type: () => Int }) stadiumId: number) {
    return this.fieldService.findByStadiumId(stadiumId);
  }

  @Mutation(() => StadiumField)
  updateField(@Args('updateFieldInput') updateFieldInput: UpdateFieldInput) {
    return this.fieldService.update(updateFieldInput.id, updateFieldInput);
  }

  @Mutation(() => StadiumField)
  removeField(@Args('id', { type: () => Int }) id: number) {
    return this.fieldService.remove(id);
  }
}
