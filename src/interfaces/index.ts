import { Orm, Em } from '../models/server'

export interface ApolloContext {
  em: Em | null
  orm: Orm | null
}
