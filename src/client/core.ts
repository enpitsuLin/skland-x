import type { FetchContext } from 'ofetch'
import type { Binding, Client, ClientConfig, SklandResponse } from '../types'
import { defu } from 'defu'
import { createFetch } from 'ofetch'
import assert from 'tiny-invariant'
import { createStorage } from 'unstorage'
import { hmacSha256, md5 } from '../crypto'
import { getDid } from '../utils'
import { buildSubtle } from './subtle'

function parseURL(ctx: FetchContext): URL {
  const url = typeof ctx.request === 'string' ? ctx.request : ctx.request.url
  if (URL.canParse(url))
    return new URL(url)
  return new URL(url, ctx.options.baseURL)
}

export const SERVER_TIMESTAMP_OFFSET: number = -2 * 1000
export const STORAGE_OAUTH_TOKEN_KEY: string = 'hypergryph:token'
export const STORAGE_CRED_KEY: string = 'hypergryph:cred'

export function createClient(config: ClientConfig = {}): Client {
  const { baseURL, timeout, driver } = defu(config, {
    baseURL: 'https://zonai.skland.com',
    timeout: 30 * 1000,
  })

  const storage = createStorage<string>(driver ? { driver } : undefined)

  async function signRequest(ctx: FetchContext) {
    const token = await storage.get(STORAGE_OAUTH_TOKEN_KEY)
    const cred = await storage.get(STORAGE_CRED_KEY)

    assert(cred, '【skland-x】森空岛 cred 未获取')
    assert(token, '【skland-x】森空岛 token 未设置')

    const parsedURL = parseURL(ctx)
    const headers = new Headers(ctx.options.headers)

    const query = new URLSearchParams(ctx.options.query ?? {}).toString()

    const timestamp = (Date.now() - SERVER_TIMESTAMP_OFFSET).toString().slice(0, -3)

    const signatureHeaders = {
      platform: '1',
      timestamp,
      dId: '',
      vName: '1.21.0',
    }

    const str = `${parsedURL.pathname}${query}${ctx.options.body ? JSON.stringify(ctx.options.body) : ''}${timestamp}${JSON.stringify(signatureHeaders)}`

    const signature = await md5(await hmacSha256(token, str))

    Object.entries(signatureHeaders).forEach(([key, value]) => {
      headers.append(key, value)
    })
    headers.append('sign', signature)

    ctx.options.headers = headers
  }

  const $fetch = createFetch({
    defaults: {
      baseURL,
      timeout,
    },
  })

  async function signIn(token: string) {
    const data = await $fetch<SklandResponse<{ cred: string, userId: string, token: string }>>(
      '/web/v1/user/auth/generate_cred_by_code',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
          'referer': 'https://www.skland.com/',
          'origin': 'https://www.skland.com',
          'dId': await getDid(),
          'platform': '3',
          'timestamp': `${Math.floor(Date.now() / 1000)}`,
          'vName': '1.0.0',
        },
        body: {
          code: token,
          kind: 1,
        },
      },
    ).then(res => res.data)

    await storage.setItems([
      { key: STORAGE_OAUTH_TOKEN_KEY, value: data.token },
      { key: STORAGE_CRED_KEY, value: data.cred },
    ])
  }

  const subtle = buildSubtle($fetch)

  const client = {
    $fetch,
    storage,
    signIn,
    subtle,
    player: {
      getBinding() {
        return $fetch<SklandResponse<Binding>>('/api/v1/game/player/binding', { onRequest: signRequest })
          .then(res => res.data)
      },
    },
  }

  return client
}
