import {
  RedisClientType,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from 'redis'

export type PubSubClient = RedisClientType<RedisModules, RedisFunctions, RedisScripts>
