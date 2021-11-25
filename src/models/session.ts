import session from 'express-session'
import Redis, { Redis as RedisType } from 'ioredis'
import connectRedis, { RedisStore } from 'connect-redis'

import { COOKIE_NAME, isProd } from '../utils/constants'

class Session {
  private Client: RedisType
  private Store: RedisStore

  constructor() {
    this.Client = new Redis()
    this.Store = connectRedis(session)
  }

  get redis() {
    return this.Client
  }

  get sessionMiddleware() {
    return session({
      resave: false,
      name: COOKIE_NAME,
      secret: 'keyboard cat',
      saveUninitialized: false,
      cookie: {
        secure: isProd, // https only
        httpOnly: true,
        sameSite: 'lax', // csrf
        maxAge: 1000 * 60 * 60 * 24 // 24h
      },
      store: new this.Store({ client: this.Client, disableTouch: true })
    })
  }
}

export default Session
