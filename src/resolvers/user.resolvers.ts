import argon2 from 'argon2'
import {
  Arg,
  Ctx,
  Field,
  Query,
  Mutation,
  Resolver,
  InputType,
  ObjectType
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
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: ApolloContext): Promise<User | null> {
    if (!req.session.userId) return null

    const user = await em.findOne(User, { id: req.session.userId })
    return user
  }

  @Mutation(() => UserResponse)
  async register(
    @Ctx() { em, req }: ApolloContext,
    @Arg('input') input: UsernamePasswordInput
  ): Promise<UserResponse> {
    const { password, username } = input

    if (username.trim().length <= 2) {
      return {
        errors: [{ field: 'username', message: 'Must be greater than 2' }]
      }
    }

    if (password.trim().length <= 2) {
      return {
        errors: [{ field: 'password', message: 'Must be greater than 2' }]
      }
    }

    const hashPassword = await argon2.hash(password)

    const user = em.create(User, {
      username: username,
      password: hashPassword
    })

    try {
      await em.persistAndFlush(user)
    } catch (error) {
      if (error.code === '23505') {
        return {
          errors: [{ field: 'username', message: 'Username already taken' }]
        }
      }
    }

    req.session.userId = user.id

    return { user }
  }

  @Mutation(() => UserResponse)
  async login(
    @Ctx() { em, req }: ApolloContext,
    @Arg('input') input: UsernamePasswordInput
  ): Promise<UserResponse> {
    const { password, username } = input

    const user = await em.findOne(User, { username })
    if (!user) {
      return {
        errors: [{ field: 'username', message: 'User doesnt exist.' }]
      }
    }

    const valid = await argon2.verify(user.password, password)
    if (!valid) {
      return {
        errors: [{ field: 'password', message: 'Incorrect password' }]
      }
    }

    req.session.userId = user.id

    return { user }
  }
}

export default UserResolvers
