import { Redis } from 'ioredis'
import { Request, Response } from 'express'
import session, { Session } from 'express-session'

export interface Req extends Request {
  session: Session & Partial<session.SessionData> & { userId?: number }
}

export interface ApolloContext {
  req: Req
  res: Response
  redis: Redis
}
