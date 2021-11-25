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
import { v4 } from 'uuid'
import { EntityManager } from '@mikro-orm/postgresql'

import User from '../entities/Users'
import sendEmail from '../utils/sendEmail'
import { ApolloContext } from '../interfaces'
import { createLink } from '../utils/createLink'
import { validateRegister } from '../validation/validateRegister'
import { COOKIE_NAME, FORGOT_PASS_PREFIX } from '../utils/constants'

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
  // ME
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

  // FORGOT PASSWORD
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { em, redis }: ApolloContext
  ) {
    const user = await em.findOne(User, { email })
    if (!user) return false

    const token = v4()
    const link = createLink(token)
    await redis.set(
      FORGOT_PASS_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 24 * 3
    )
    await sendEmail(email, link)

    return true
  }

  // CHANGE PASSWORD
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('password') password: string,
    @Ctx() { em, req, redis }: ApolloContext
  ): Promise<UserResponse> {
    if (password.trim().length <= 2) {
      return {
        errors: [{ field: 'password', message: 'Must be grater than 2' }]
      }
    }

    const userID = await redis.get(FORGOT_PASS_PREFIX + token)
    if (!userID) {
      return {
        errors: [{ field: 'token', message: 'Expired token' }]
      }
    }

    const user = await em.findOne(User, { id: +userID })
    if (!user) {
      return {
        errors: [{ field: 'token', message: 'User no longer exists' }]
      }
    }

    const hashPassword = await argon2.hash(password)
    user.password = hashPassword
    await em.persistAndFlush(user)

    await redis.del(FORGOT_PASS_PREFIX + token)

    req.session.userId = user.id

    return { user }
  }
}

export default UserResolvers
