import type { AttendanceAwards, AttendanceStatus, ClientGame, SklandResponse } from "../../types"
import { signRequest } from "../../utils/signature"
import { useClientContext } from "../ctx"

export function buildSubtleGame(): ClientGame {
  const { $fetch, storage } = useClientContext()
  return {
    async getAttendanceStatus(query) {
      const res = await $fetch<SklandResponse<AttendanceStatus>>(
        `/api/v1/game/attendance`,
        {
          onRequest: ctx => signRequest(ctx, storage),
          query,
        },
      )
      if (res.code !== 0)
        throw new Error(`【skland-x】获取签到状态错误: ${res.message}`)

      return res.data
    },
    async attendance(body) {
      const res = await $fetch<SklandResponse<AttendanceAwards>>(
        `/api/v1/game/attendance`,
        {
          method: 'POST',
          onRequest: ctx => signRequest(ctx, storage),
          body,
        },
      )
      if (res.code !== 0)
        throw new Error(`【skland-x】执行签到错误: ${res.message}`)

      return res.data
    },
  }
}
