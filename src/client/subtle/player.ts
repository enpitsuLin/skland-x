import type { ClientPlayer, PlayerBinding, PlayerInfo, SklandResponse } from '../../types'
import { signRequest } from '../../utils/signature'
import { useClientContext } from '../ctx'

export function buildSubtlePlayer(): ClientPlayer {
  const { $fetch, storage } = useClientContext()
  return {
    async getBinding() {
      const res = await $fetch<SklandResponse<PlayerBinding>>(
        `/api/v1/game/player/binding`,
        {
          onRequest: ctx => signRequest(ctx, storage),
        },
      )

      if (res.code !== 0)
        throw new Error(`【skland-x】获取游戏绑定信息错误: ${res.message}`)

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
        throw new Error(`【skland-x】获取玩家信息错误: ${res.message}`)

      return res.data
    },
  }
}
