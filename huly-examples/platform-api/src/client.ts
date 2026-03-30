import { ConnectOptions, NodeWebSocketFactory, connect } from '@hcengineering/api-client'
import contact from '@hcengineering/contact'

const url = process.env.HULY_URL ?? 'http://localhost:8087'
const options: ConnectOptions = {
  email: process.env.HULY_EMAIL ?? 'user1',
  password: process.env.HULY_PASSWORD ?? '1234',
  workspace: process.env.HULY_WORKSPACE ?? 'ws1',
  socketFactory: NodeWebSocketFactory,
  connectionTimeout: 30000
}

export async function createClient () {
  return await connect(url, options)
}

export async function getMyPersonId (client: any): Promise<string> {
  const account = await client.getAccount()
  const persons = await client.findAll(contact.class.Person, {})
  const me = persons.find((p: any) => p.personUuid === account.uuid)
  if (me === undefined) {
    throw new Error('Could not find your person record')
  }
  return me._id
}
