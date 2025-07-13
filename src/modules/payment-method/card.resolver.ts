import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CardService } from './card.service';
import { Card } from './entities/card.entity';
import { CreateCardInput } from './dto/create-card.input';
import { UpdateCardInput } from './dto/update-card.input';

@Resolver(() => Card)
export class CardResolver {
  constructor(private readonly cardService: CardService) {}

  @Mutation(() => Card)
  createCard(
    @Args('createCardInput') createCardInput: CreateCardInput,
  ): Promise<Card> {
    return this.cardService.create(createCardInput);
  }

  @Mutation(() => Card)
  updateCard(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateCardInput') updateCardInput: UpdateCardInput,
  ): Promise<Card> {
    return this.cardService.update(id, updateCardInput);
  }

  @Query(() => Card)
  card(@Args('id', { type: () => Int }) id: number): Promise<Card> {
    return this.cardService.getById(id);
  }

  @Query(() => [Card])
  cards(): Promise<Card[]> {
    return this.cardService.getAll();
  }

  @Query(() => [Card])
  userCards(
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<Card[]> {
    return this.cardService.getByUserId(userId);
  }

  @Query(() => Card, { nullable: true })
  userSavedCard(
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<Card | null> {
    return this.cardService.getSavedCardByUserId(userId);
  }
}
