import path from 'path'
import { MikroORM } from '@mikro-orm/core'

import Posts from './entities/Posts'
import Users from './entities/Users'
import { isProd } from './utils/constants'

export default {
  debug: !isProd,
  user: 'root',
  password: 'root',
  type: 'postgresql',
  dbName: 'yarreddit',
  migrations: {
    pattern: /^[\w-]+\d+\.[tj]s$/,
    path: path.join(__dirname, './migrations')
  },
  entities: [Posts, Users]
} as Parameters<typeof MikroORM.init>[0]
