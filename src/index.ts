import Server from './models/server'

const server = new Server()

const main = async () => {
  await server.start().catch((err) => console.log(err))
}

main()
