import path from 'path'
import { createConnection } from 'typeorm'

import Posts from '../entities/Posts'
import Users from '../entities/Users'
import { isProd } from '../utils/constants'

class Database {
  async connect() {
    const orm = await createConnection({
      logging: !isProd,
      type: 'postgres',
      username: 'root',
      password: 'root',
      synchronize: true,
      database: 'yarredditv2',
      entities: [Posts, Users],
      migrations: [path.join(__dirname, '../migrations/*')]
    })

    await orm.runMigrations()

    // await Posts.delete({})

    return orm
  }
}

export default Database
