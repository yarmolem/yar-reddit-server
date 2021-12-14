import path from 'path'
import Updoot from '../entities/Updoot'
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
      entities: [Posts, Users, Updoot],
      migrations: [path.join(__dirname, '../migrations/*')]
    })

    await orm.runMigrations()

    // await Posts.delete({})

    return orm
  }
}

export default Database
