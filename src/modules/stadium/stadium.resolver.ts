import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
} from '@nestjs/graphql';
import { StadiumService } from './stadium.service';
import { Stadium } from './entities/stadium.entity';
import { CreateStadiumInput } from './dto/create-stadium.input';
import { UpdateStadiumInput } from './dto/update-stadium.input';
import { UpdateStadiumBankInput } from './dto/update-stadium-bank.input';
import { UpdateStadiumImagesInput } from './dto/update-stadium-images.input';

@Resolver(() => Stadium)
export class StadiumResolver {
  constructor(private readonly stadiumService: StadiumService) {}

  @Mutation(() => Stadium)
  createStadium(@Args('createStadiumInput') createStadiumInput: CreateStadiumInput) {
    return this.stadiumService.create(createStadiumInput);
  }

  @Query(() => [Stadium], { name: 'stadiums' })
  findAll() {
    return this.stadiumService.findAll();
  }

  @Query(() => Stadium, { name: 'stadium' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.stadiumService.findOne(id);
  }

  @Query(() => [Stadium], { name: 'stadiumsByUser' })
  findByUserId(@Args('userId', { type: () => Int }) userId: number) {
    return this.stadiumService.findByUserId(userId);
  }

  @Mutation(() => Stadium)
  updateStadium(@Args('updateStadiumInput') updateStadiumInput: UpdateStadiumInput) {
    return this.stadiumService.update(updateStadiumInput.id, updateStadiumInput);
  }

  @Mutation(() => Stadium)
  updateStadiumBank(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateStadiumBankInput,
  ) {
    return this.stadiumService.updateBank(id, input);
  }

  @Mutation(() => Stadium)
  updateStadiumImages(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateStadiumImagesInput,
  ) {
    return this.stadiumService.updateImages(id, input);
  }

  @Mutation(() => Stadium)
  removeStadium(@Args('id', { type: () => Int }) id: number) {
    return this.stadiumService.remove(id);
  }
} 