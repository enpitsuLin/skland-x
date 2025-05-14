import type { Client, ClientConfig, SklandResponse } from '../types'
import { defu } from 'defu'
import { createFetch } from 'ofetch'
import { createStorage } from 'unstorage'
import { STORAGE_CRED_KEY, STORAGE_OAUTH_TOKEN_KEY } from '../constants'
import { getDid } from '../utils/env'
import { clientCtx } from './ctx'
import { buildSubtle } from './subtle'

export function createClient(config: ClientConfig = {}): Client {
  const { baseURL, timeout, driver } = defu(config, {
    baseURL: 'https://zonai.skland.com',
    timeout: 30 * 1000,
  })

  const storage = createStorage<string>(driver ? { driver } : undefined)

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

  const subtle = clientCtx.call({ storage, $fetch }, buildSubtle)

  const client = Object.freeze({
    $fetch,
    storage,
    signIn,
    subtle,
  })

  return client
}
