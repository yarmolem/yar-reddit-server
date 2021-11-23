import argon2 from 'argon2'
import validator from 'validator'
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
import { EntityManager } from '@mikro-orm/postgresql'

import User from '../entities/Users'
import { ApolloContext } from '../interfaces'
import { COOKIE_NAME } from '../utils/constants'
import { validateRegister } from '../validation/validateRegister'

@InputType()
export class UsernamePasswordInput {
  @Field()
  email: string

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

  // REGISTER
  @Mutation(() => UserResponse)
  async register(
    @Ctx() { em, req }: ApolloContext,
    @Arg('input') input: UsernamePasswordInput
  ): Promise<UserResponse> {
    const errors = validateRegister(input)
    if (errors) return { errors }

    const hashPassword = await argon2.hash(input.password)

    let user

    try {
      const res = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          ...input,
          password: hashPassword,
          updated_at: new Date(),
          created_at: new Date()
        })
        .returning('*')

      user = res[0]
    } catch (error) {
      console.log(error)
      if (error.code === '23505') {
        const field = error.detail.includes('email') ? 'email' : 'username'
        const message =
          field === 'email' ? 'Email already taken' : 'Username already taken'
        return { errors: [{ field, message }] }
      }
    }

    req.session.userId = user.id
    return { user }
  }

  // LOGIN
  @Mutation(() => UserResponse)
  async login(
    @Ctx() { em, req }: ApolloContext,
    @Arg('password') password: string,
    @Arg('usernameOrEmail') usernameOrEmail: string
  ): Promise<UserResponse> {
    const isEmail = validator.isEmail(usernameOrEmail)

    const user = await em.findOne(User, {
      [isEmail ? 'email' : 'username']: usernameOrEmail
    })

    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: 'User doesnt exist.'
          }
        ]
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

  // LOGOUT
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: ApolloContext): Promise<boolean> {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        if (err) {
          resolve(false)
          return
        }

        res.clearCookie(COOKIE_NAME)
        resolve(true)
      })
    })
  }
}

export default UserResolvers
