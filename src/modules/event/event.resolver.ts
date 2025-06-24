import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { Event, EventParticipant } from './dto/event-response.dto';
import { CreateEventInput } from './dto/create-event.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver(() => Event)
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation(() => Event)
  @UseGuards(GqlAuthGuard)
  async createEvent(
    @Args('input') input: CreateEventInput,
    @Context() context: any,
  ): Promise<Event> {
    const userId = context.req.user.id;
    return this.eventService.createEvent(input, userId);
  }

  @Query(() => Event)
  @UseGuards(GqlAuthGuard)
  async getEvent(@Args('id') id: number): Promise<Event> {
    return this.eventService.getEventById(id);
  }

  @Query(() => [Event])
  @UseGuards(GqlAuthGuard)
  async getMyEvents(@Context() context: any): Promise<Event[]> {
    const userId = context.req.user.id;
    return await this.eventService.getUserEvents(userId);
  }

  @Query(() => [Event])
  async getPublicEvents(): Promise<Event[]> {
    return await this.eventService.getPublicEvents();
  }

  @Query(() => [Event])
  async events(): Promise<Event[]> {
    return await this.eventService.getAllEvents();
  }

  @Mutation(() => EventParticipant)
  @UseGuards(GqlAuthGuard)
  async joinEvent(
    @Args('eventId') eventId: string,
    @Context() context: any,
  ): Promise<EventParticipant> {
    const userId = context.req.user.id;
    return await this.eventService.joinEvent(parseInt(eventId), userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async leaveEvent(
    @Args('eventId') eventId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return await this.eventService.leaveEvent(parseInt(eventId), userId);
  }
}
