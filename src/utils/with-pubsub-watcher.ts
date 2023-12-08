import { createLogger } from '../factories/logger-factory'
import { getPubSubClient } from '../pubsub/client'

const debug = createLogger('with-pubsub-watcher')

// 创建 Redis 客户端
const subscriber = getPubSubClient().duplicate()
subscriber.on('error', err => debug(err))
subscriber.connect()

// TODO: 超时处理

export function withPubSubWatcher<T>(key: string, fn: () => Promise<T>): () => Promise<T> {
  return async () => {
    let listener: (message: string, channel: string) => void
    let abort: (reason?: any) => void

    const watcher = new Promise((resolve, reject) => {
      listener = (message, channel) => {
        debug('message: %s, channel: %s', message, channel)
        resolve(message)
      }
      abort = reject
    })

    let data: T

    try {
      // 订阅通知 Channel
      try {
        await subscriber.subscribe(key, listener)
      } catch (err) {
        console.error('subscribe error: %s', err)
        abort(err)
      }

      data = await fn()

      // 如果查询结果为空，则等待通知消息并再次查询
      if (!data || Array.isArray(data) && !data.length) {
        debug('query result is empty, waiting...')
        await watcher
        data = await fn()
      }
    } finally {
      subscriber.unsubscribe(key, listener).catch(err => {
        console.error('unsubscribe error: %s', err)
      })
    }

    return data
  }
}
