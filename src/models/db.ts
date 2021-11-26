import { isProd } from '../utils/constants'
import { createConnection } from 'typeorm'

import Posts from '../entities/Posts'
import Users from '../entities/Users'

class Database {
  async connect() {
    const orm = await createConnection({
      logging: isProd,
      type: 'postgres',
      username: 'root',
      password: 'root',
      synchronize: true,
      database: 'yarredditv2',
      entities: [Posts, Users]
    })

    return orm
  }
}

export default Database
