import type { ClientPlayer, ClientSubtle, HypergrayphonResponse, Hypergryph, Player, PlayerInfo, SklandResponse } from '../types'
import defu from 'defu'
import { signRequest } from '../utils/signature'
import { clientCtx, useClientContext } from './ctx'

export function buildSubtle(): ClientSubtle {
  const context = useClientContext()
  return clientCtx.call(context, () => {
    return {
      hypergryph: buildHypergryph(),
      score: {},
      player: buildPlayer(),
    }
  })
}

function buildHypergryph(): Hypergryph {
  const { $fetch } = useClientContext()
  const $fetchHypergryph = $fetch.create({
    baseURL: 'https://as.hypergryph.com',
  })
  return {
    async sendPhoneCode(phone: string) {
      const res = await $fetchHypergryph<HypergrayphonResponse<any>>(
        '/general/v1/send_phone_code',
        {
          method: 'POST',
          body: { phone, type: 2 },
        },
      )

      if (res.status !== '0')
        throw new Error(`【skland-x】发送手机验证码错误:${res.msg}`)
    },
    async generateScanLoginUrl() {
      const res = await $fetchHypergryph<HypergrayphonResponse<{ scanId: string, scanUrl: string }>>(
        '/general/v1/gen_scan/login',
        {
          method: 'POST',
          body: { appCode: '4ca99fa6b56cc2ba' },
        },
      )

      if (res.status !== '0')
        throw new Error(`【skland-x】生成扫码登录 URL 错误:${res.msg}`)

      return res.data
    },
    async getScanStatus(scanId: string) {
      const res = await $fetchHypergryph<HypergrayphonResponse<{ scanCode: string, scanStatus: string }>>(
        '/general/v1/scan_status',
        {
          query: { scanId },
        },
      )

      if (res.status !== '0')
        throw new Error(`【skland-x】获取扫码登录状态错误:${res.msg}`)

      return res.data
    },
    async getOAuthTokenByPhonePassword(data: { phone: string, password: string }) {
      const res = await $fetchHypergryph<HypergrayphonResponse<{ token: string }>>(
        '/user/auth/v1/token_by_phone_password',
        {
          method: 'POST',
          body: data,
        },
      )

      if (res.status !== '0')
        throw new Error(`【skland-x】通过手机号和密码获取鹰角 OAuth token 错误:${res.msg}`)

      return res.data.token
    },
    async getOAuthTokenByPhoneCode(data: { phone: string, code: string }) {
      const res = await $fetchHypergryph<HypergrayphonResponse<{ token: string }>>(
        '/user/auth/v1/token_by_phone_code',
        {
          method: 'POST',
          body: data,
        },
      )

      if (res.status !== '0')
        throw new Error(`【skland-x】通过手机号和验证码获取鹰角 OAuth token 错误:${res.msg}`)

      return res.data.token
    },
    async getOAuthTokenByScanCode(scanCode: string) {
      const res = await $fetchHypergryph<HypergrayphonResponse<{ token: string }>>(
        '/user/auth/v1/token_by_scan_code',
        {
          method: 'POST',
          body: { scanCode },
        },
      )

      if (res.status !== '0')
        throw new Error(`【skland-x】通过扫码获取鹰角 OAuth token 错误:${res.msg}`)

      return res.data.token
    },
    async grantAuthorizeCode(
      token: string,
      options?: {
        appCode?: string
        type?: number
      },
    ) {
      const { appCode, type } = defu(options, {
        appCode: '4ca99fa6b56cc2ba',
        type: 0,
      })
      const res = await $fetchHypergryph<HypergrayphonResponse<{ code: string, uid: string }>>(
        '/user/oauth2/v2/grant',
        {
          method: 'POST',
          body: {
            appCode,
            token,
            type,
          },
        },
      )

      if (!res.data)
        throw new Error(`【skland-x】登录获取 cred 错误:${res.msg}`)

      return res.data
    },
  }
}

function buildPlayer(): ClientPlayer {
  const { $fetch, storage } = useClientContext()
  return {
    async getBinding() {
      const res = await $fetch<SklandResponse<Player>>(
        `/api/v1/game/player/binding`,
        {
          onRequest: ctx => signRequest(ctx, storage),
        },
      )

      if (res.code !== 0)
        throw new Error(`【skland-x】获取绑定信息错误:${res.message}`)

      return res.data
    },
    async getInfo() {
      const res = await $fetch<SklandResponse<PlayerInfo>>(
        `/api/v1/game/player/info`,
        {
          onRequest: ctx => signRequest(ctx, storage),
        },
      )

      if (res.code !== 0)
        throw new Error(`【skland-x】获取玩家信息错误:${res.message}`)

      return res.data
    },
  }
}
