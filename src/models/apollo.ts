import { Redis } from 'ioredis'
import { Express } from 'express'
import { buildSchema } from 'type-graphql'
import { ApolloServer } from 'apollo-server-express'

import { ApolloContext } from '../interfaces'
import PostResolvers from '../resolvers/post.resolvers'
import UserResolvers from '../resolvers/user.resolvers'

interface StartProps {
  redis: Redis
}

class Apollo {
  private app: Express
  apollo: ApolloServer

  constructor(app: Express) {
    this.app = app
  }

  async start({ redis }: StartProps) {
    try {
      this.apollo = new ApolloServer({
        schema: await buildSchema({
          resolvers: [PostResolvers, UserResolvers],
          validate: false
        }),
        context: ({ req, res }): ApolloContext => ({
          res,
          req,
          redis
        })
      })

      this.apollo.applyMiddleware({ app: this.app, cors: false })
    } catch (error) {
      console.log('[APOLLO] - ', error)
    }
  }
}

export default Apollo
