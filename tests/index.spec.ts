/// <reference types="vitest/importMeta" />
import { describe, expect, it } from 'vitest'
import { createClient } from '../src'
import { STORAGE_CREDENTIAL_KEY, STORAGE_OAUTH_TOKEN_KEY } from '../src/constants'

describe("skland-x client", () => {

  it('should have some properties', () => {
    const client = createClient()
    expect(client).toHaveProperty('$fetch')
    expect(client).toHaveProperty('signIn')
    expect(client).toHaveProperty('refresh')
    expect(client).toHaveProperty('subtle')

    expect(client.subtle).toHaveProperty('hypergryph')
    expect(client.subtle).toHaveProperty('score')
    expect(client.subtle).toHaveProperty('player')
    expect(client.subtle).toHaveProperty('game')

    expect(client.subtle.hypergryph).toHaveProperty('grantAuthorizeCode')

    expect(client.subtle.player).toHaveProperty('getBinding')
    expect(client.subtle.player).toHaveProperty('getInfo')

    expect(client.subtle.game).toHaveProperty('getAttendanceStatus')
    expect(client.subtle.game).toHaveProperty('attendance')
  })

  it('should authorize hypergryph', async () => {
    const client = createClient()

    const data = await client.subtle.hypergryph.grantAuthorizeCode(import.meta.env.VITE_SKLAND_TOKEN!)
    expect(data).toHaveProperty('code')
    expect(data).toHaveProperty('uid')
  })

  it('should sign in skland', async () => {
    const client = createClient()
    const res = await client.subtle.hypergryph.grantAuthorizeCode(import.meta.env.VITE_SKLAND_TOKEN!)

    await client.signIn(res.code)

    expect(await client.storage.hasItem(STORAGE_CREDENTIAL_KEY)).toBe(true)
    expect(await client.storage.hasItem(STORAGE_OAUTH_TOKEN_KEY)).toBe(true)
  })

  it('should throw error', async () => {
    const client = createClient()

    await expect(client.subtle.player.getBinding)
      .rejects
      .toThrow('【skland-x】森空岛 cred 未获取')
  })

  it('should refresh token', async () => {
    const client = createClient()

    const res = await client.subtle.hypergryph.grantAuthorizeCode(import.meta.env.VITE_SKLAND_TOKEN!)

    await client.signIn(res.code)

    await client.storage.setItem(STORAGE_OAUTH_TOKEN_KEY, '123')

    await client.refresh()

    const tokenNew = await client.storage.getItem(STORAGE_OAUTH_TOKEN_KEY)
    expect(tokenNew).toBeDefined()
    expect(tokenNew).not.toBe('123')
  })
})
