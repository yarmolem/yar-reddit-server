import { Express } from 'express'
import { buildSchema } from 'type-graphql'
import { ApolloServer } from 'apollo-server-express'

import { Orm } from './server'
import { ApolloContext } from '../interfaces'
import PostResolvers from '../resolvers/post.resolvers'

class Apollo {
  private app: Express
  apollo: ApolloServer

  constructor(app: Express) {
    this.app = app
  }

  async start(orm: Orm | null) {
    try {
      this.apollo = new ApolloServer({
        schema: await buildSchema({
          resolvers: [PostResolvers],
          validate: false
        }),
        context: (): ApolloContext => ({ em: orm!.em, orm })
      })

      this.apollo.applyMiddleware({ app: this.app })
    } catch (error) {
      console.log('[APOLLO] - ', error)
    }
  }
}

export default Apollo
