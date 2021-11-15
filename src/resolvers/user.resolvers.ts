import argon2 from 'argon2'
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver
} from 'type-graphql'

import User from '../entities/Users'
import { ApolloContext } from '../interfaces'

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string

  @Field()
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User | undefined

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]
}

@Resolver()
class UserResolvers {
  @Query(() => [User])
  async getUsers(@Ctx() { em }: ApolloContext): Promise<User[]> {
    return em.find(User, {})
  }

  @Mutation(() => UserResponse)
  async register(
    @Ctx() { em }: ApolloContext,
    @Arg('input') input: UsernamePasswordInput
  ): Promise<UserResponse> {
    const hashPassword = await argon2.hash(input.password)

    const user = em.create(User, {
      password: hashPassword,
      username: input.username
    })

    await em.persistAndFlush(user)
    return { user }
  }
}

export default UserResolvers
