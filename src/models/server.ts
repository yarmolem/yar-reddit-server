import express, { Express } from 'express'
import {
  MikroORM,
  Connection,
  EntityManager,
  IDatabaseDriver
} from '@mikro-orm/core'

import Database from './db'
import Apollo from './apollo'

export type Orm = MikroORM<IDatabaseDriver<Connection>>
export type Em = EntityManager<IDatabaseDriver<Connection>>

class Server {
  app: Express
  port: number | string
  apollo: Apollo

  db: Database
  orm: Orm | null

  constructor() {
    this.app = express()
    this.port = process.env.PORT ?? 8080

    this.db = new Database()

    this.apollo = new Apollo(this.app)
  }

  async start() {
    // DB connection
    this.orm = await this.db.connect()

    // Start Apollo
    await this.apollo.start(this.orm)

    // Start Server
    this.app.listen(this.port, () => {
      console.log(`Running on port ${this.port}`)
    })
  }
}

export default Server
