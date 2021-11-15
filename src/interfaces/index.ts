import {
  MikroORM,
  Connection,
  EntityManager,
  IDatabaseDriver
} from '@mikro-orm/core'

export type Orm = MikroORM<IDatabaseDriver<Connection>>
export type Em = EntityManager<IDatabaseDriver<Connection>>

export interface ApolloContext {
  em: Em
  orm: Orm
}
