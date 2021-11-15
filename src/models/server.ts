import express, { Express } from 'express'

import Database from './db'
import Apollo from './apollo'
import Session from './session'

class Server {
  app: Express
  db: Database
  apollo: Apollo
  session: Session
  port: number | string

  constructor() {
    this.port = process.env.PORT ?? 8080
    this.app = express()
    this.db = new Database()
    this.session = new Session()
    this.apollo = new Apollo(this.app)
  }

  middlewares() {
    this.app.use(this.session.sessionMiddleware)
  }

  async start() {
    // DB connection
    const orm = await this.db.connect()

    // Start middlewares
    this.middlewares()

    // Start Apollo
    await this.apollo.start({ orm })

    // Start Server
    this.app.listen(this.port, () => {
      console.log(`Running on port ${this.port}`)
    })
  }
}

export default Server
