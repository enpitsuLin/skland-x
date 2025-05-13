/// <reference types="vitest/importMeta" />

import { describe, expect, it } from 'vitest'
import { createClient, STORAGE_CRED_KEY, STORAGE_OAUTH_TOKEN_KEY } from '../src'

describe("skland-x client", () => {

  it('should have some properties', () => {
    const client = createClient()
    expect(client).toHaveProperty('$fetch')
    expect(client).toHaveProperty('signIn')
    expect(client).toHaveProperty('subtle')
    expect(client).toHaveProperty('player')

    expect(client.subtle).toHaveProperty('hypergryph')
    expect(client.subtle).toHaveProperty('score')
    expect(client.subtle.hypergryph).toHaveProperty('authorize')
  })

  it('should authorize hypergryph', async () => {
    const client = createClient()

    const data = await client.subtle.hypergryph.authorize(import.meta.env.VITE_SKLAND_TOKEN!)
    expect(data).toHaveProperty('code')
    expect(data).toHaveProperty('uid')
  })

  it('should sign in skland', async () => {
    const client = createClient()
    const res = await client.subtle.hypergryph.authorize(import.meta.env.VITE_SKLAND_TOKEN!)

    await client.signIn(res.code)

    expect(await client.storage.hasItem(STORAGE_CRED_KEY)).toBe(true)
    expect(await client.storage.hasItem(STORAGE_OAUTH_TOKEN_KEY)).toBe(true)
  })

  it('should throw error', async () => {
    const client = createClient()

    await expect(client.player.getBinding)
      .rejects
      .toThrow('【skland-x】森空岛 cred 未获取')
  })
})
