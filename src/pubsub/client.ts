import { createClient, RedisClientOptions } from 'redis'
import { createLogger } from '../factories/logger-factory'
import { PubSubClient } from '../@types/pubsub'


const debug = createLogger('pubsub-redis-client')

export const getPubSubConfig = (): RedisClientOptions => ({
  url: process.env.REDIS_URI ? process.env.REDIS_URI : `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
})

let instance: PubSubClient | undefined = undefined

export const getPubSubClient = (): PubSubClient => {
  if (!instance) {
    const config = getPubSubConfig()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...loggableConfig } = config
    debug('config: %o', loggableConfig)
    instance = createClient(config)
  }

  return instance
}
