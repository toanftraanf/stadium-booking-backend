import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateStadiumBankInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  bank?: string;

  @Field({ nullable: true })
  accountName?: string;

  @Field({ nullable: true })
  accountNumber?: string;
}
