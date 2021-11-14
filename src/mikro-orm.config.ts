import path from 'path'
import { MikroORM } from '@mikro-orm/core'

import Post from './entities/Post'
import { isProd } from './utils/constants'

export default {
  debug: !isProd,
  user: 'postgres',
  password: 'root',
  dbName: 'yareddit',
  type: 'postgresql',
  migrations: {
    pattern: /^[\w-]+\d+\.[tj]s$/,
    path: path.join(__dirname, './migrations')
  },
  entities: [Post]
} as Parameters<typeof MikroORM.init>[0]
