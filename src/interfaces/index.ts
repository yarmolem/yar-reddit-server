import { FilterValue } from '@mikro-orm/core/typings'
import { Request, Response } from 'express'
import session, { Session } from 'express-session'
import { Redis } from 'ioredis'

export interface Req extends Request {
  session: Session &
    Partial<session.SessionData> & { userId?: FilterValue<number> }
}

export interface ApolloContext {
  req: Req
  res: Response
  redis: Redis
}
