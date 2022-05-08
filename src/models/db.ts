// import path from 'path'
import Updoot from '../entities/Updoot'
import { createConnection } from 'typeorm'

import Posts from '../entities/Posts'
import Users from '../entities/Users'
import { isProd } from '../utils/constants'

class Database {
  async connect() {
    const orm = await createConnection({
      logging: isProd,
      type: 'postgres',
      username: 'yarmo',
      password: 'yarmo',
      synchronize: true,
      database: 'yarmo',
      entities: [Posts, Users, Updoot]
    })

    console.log('Connected to Database')

    return orm
  }
}

export default Database
