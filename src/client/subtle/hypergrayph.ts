import type { FetchOptions } from 'ofetch'
import type { HypergrayphonResponse, Hypergryph } from '../../types'
import defu from 'defu'
import { useClientContext } from '../ctx'

export function buildSubtleHypergryph(): Hypergryph {
  const { $fetch } = useClientContext()
  const $fetchHypergryph = $fetch.create({
    baseURL: 'https://as.hypergryph.com',
  })

  // Helper function to handle Hypergryph API requests with unified error handling
  async function fetchHypergryph<T = any>(
    url: string,
    options: FetchOptions<'json'>,
    errorMessage: string,
  ): Promise<HypergrayphonResponse<T>> {
    const res = await $fetchHypergryph<HypergrayphonResponse<T>>(url, {
      ...options,
      onResponseError(ctx) {
        throw new Error(`【skland-x】${errorMessage}`, { cause: ctx.response._data })
      },
    })

    if (res.status !== '0') {
      throw new Error(`【skland-x】${errorMessage}`, { cause: res })
    }

    return res
  }

  return {
    async sendPhoneCode(phone: string) {
      await fetchHypergryph(
        '/general/v1/send_phone_code',
        { method: 'POST', body: { phone, type: 2 } },
        '发送手机验证码错误',
      )
    },
    async generateScanLoginUrl() {
      const res = await fetchHypergryph<{ scanId: string, scanUrl: string }>(
        '/general/v1/gen_scan/login',
        { method: 'POST', body: { appCode: '4ca99fa6b56cc2ba' } },
        '生成扫码登录 URL 错误',
      )
      return res.data
    },
    async getScanStatus(scanId: string) {
      const res = await fetchHypergryph<{ scanCode: string, scanStatus: string }>(
        '/general/v1/scan_status',
        { query: { scanId } },
        '获取扫码登录状态错误',
      )
      return res.data
    },
    async getOAuthTokenByPhonePassword(data: { phone: string, password: string }) {
      const res = await fetchHypergryph<{ token: string }>(
        '/user/auth/v1/token_by_phone_password',
        { method: 'POST', body: data },
        '通过手机号和密码获取鹰角 OAuth token 错误',
      )
      return res.data.token
    },
    async getOAuthTokenByPhoneCode(data: { phone: string, code: string }) {
      const res = await fetchHypergryph<{ token: string }>(
        '/user/auth/v1/token_by_phone_code',
        { method: 'POST', body: data },
        '通过手机号和验证码获取鹰角 OAuth token 错误',
      )
      return res.data.token
    },
    async getOAuthTokenByScanCode(scanCode: string) {
      const res = await fetchHypergryph<{ token: string }>(
        '/user/auth/v1/token_by_scan_code',
        { method: 'POST', body: { scanCode } },
        '通过扫码获取鹰角 OAuth token 错误',
      )
      return res.data.token
    },
    async grantAuthorizeCode(token: string, options?: { appCode?: string, type?: number }) {
      const { appCode, type } = defu(options, { appCode: '4ca99fa6b56cc2ba', type: 0 })

      const res = await fetchHypergryph<{ code: string, uid: string }>(
        '/user/oauth2/v2/grant',
        { method: 'POST', body: { appCode, token, type } },
        '通过 OAuth 登录凭证验证鹰角网络通行证错误',
      )

      return res.data
    },
  }
}
