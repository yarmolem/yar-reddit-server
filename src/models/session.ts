import session from 'express-session'
import redis, { RedisClient } from 'redis'
import connectRedis, { RedisStore } from 'connect-redis'

import { isProd } from '../utils/constants'

class Session {
  private Store: RedisStore
  private Client: RedisClient

  constructor() {
    this.Store = connectRedis(session)
    this.Client = redis.createClient()
  }

  get sessionMiddleware() {
    return session({
      name: 'qid',
      resave: false,
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
