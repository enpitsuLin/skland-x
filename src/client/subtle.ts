import type { ClientPlayer, ClientSubtle, Hypergryph, Player, PlayerInfo, SklandResponse } from '../types'
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
  return {
    async authorize(token: string) {
      interface GrantResponse {
        status: number
        type: string
        msg: string
        data?: { code: string, uid: string }
      }

      const data = await $fetch<GrantResponse>(
        'https://as.hypergryph.com/user/oauth2/v2/grant',
        {
          method: 'POST',
          headers: {
            'User-Agent': 'Skland/1.21.0 (com.hypergryph.skland; build:102100065; iOS 17.6.0; ) Alamofire/5.7.1',
            'Accept-Encoding': 'gzip',
            'Connection': 'close',
            'Content-Type': 'application/json',
          },
          body: {
            appCode: '4ca99fa6b56cc2ba',
            token,
            type: 0,
          },
        },
      )

      if (data.status !== 0 || !data.data)
        throw new Error(`【skland-x】登录获取 cred 错误:${data.msg}`)

      return data.data
    },
  }
}

function buildPlayer(): ClientPlayer {
  const { $fetch, storage } = useClientContext()
  return {
    getBinding() {
      return $fetch<SklandResponse<Player>>(
        `/api/v1/game/player/binding`,
        {
          onRequest: ctx => signRequest(ctx, storage),
        },
      ).then(res => res.data)
    },
    async getInfo() {
      return $fetch<SklandResponse<PlayerInfo>>(
        `/api/v1/game/player/info`,
        {
          onRequest: ctx => signRequest(ctx, storage),
        },
      ).then(res => res.data)
    },
  }
}
