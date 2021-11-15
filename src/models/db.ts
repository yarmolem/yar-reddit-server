import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core'

import config from '../mikro-orm.config'

class Database {
  async connect(): Promise<MikroORM<IDatabaseDriver<Connection>>> {
    const orm = await MikroORM.init(config).catch((err) => {
      console.log('[DB_CONNECTION]', err)
    })
    await orm!
      .getMigrator()
      .up()
      .catch((err) => {
        console.log('[DB_MIGRATION]', err)
      })
    console.log('DB ready')
    return orm!
  }
}

export default Database
