import {
  MikroORM,
  Connection,
  EntityManager,
  IDatabaseDriver
} from '@mikro-orm/core'
import { FilterValue } from '@mikro-orm/core/typings'
import { Request, Response } from 'express'
import session, { Session } from 'express-session'
import { Redis } from 'ioredis'

export type Orm = MikroORM<IDatabaseDriver<Connection>>
export type Em = EntityManager<IDatabaseDriver<Connection>>

export interface Req extends Request {
  session: Session &
    Partial<session.SessionData> & { userId?: FilterValue<number> }
}

export interface ApolloContext {
  em: Em
  orm: Orm
  req: Req
  res: Response
  redis: Redis
}
