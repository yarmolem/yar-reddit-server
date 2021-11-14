import { MikroORM } from '@mikro-orm/core'

import config from '../mikro-orm.config'

class Database {
  async connect() {
    try {
      const orm = await MikroORM.init(config)
      await orm.getMigrator().up()
      console.log('DB ready')
      return orm
    } catch (error) {
      console.log('[DB] - ', error)
    }

    return null
  }
}

export default Database
