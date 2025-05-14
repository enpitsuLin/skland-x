import type { $Fetch } from "ofetch"
import type { Driver, Storage } from "unstorage"
import type { Player, PlayerInfo } from "./player"

export interface ClientConfig {
  baseURL?: string
  /**
   * 超时时间
   */
  timeout?: number
  /**
   * 存储驱动, 默认内存
   * @description 如果需要持久化存储，请传入一个 unstorage driver
   */
  driver?: Driver
}

export interface Client {
  $fetch: $Fetch
  signIn: (token: string) => Promise<void>
  subtle: ClientSubtle
  storage: Storage<string>
}

export interface ClientSubtle {
  /** 鹰角通行证相关 */
  hypergryph: Hypergryph
  /**
   * @deprecated 森空岛 App 相关，有风控的一些功能
   */
  score: ClientScore
  player: ClientPlayer
}

export interface Hypergryph {
  /**
   * 通过 OAuth 登录凭证验证鹰角网络通行证
   *
   * @param token 鹰角网络通行证账号的登录凭证 grant_code
   * @return 返回可以用于 `signIn()`的 grant_code 参数
   */
  authorize: (token: string) => Promise<{ code: string, uid: string }>
}

export interface ClientScore {

}

export interface ClientPlayer {
  getBinding: () => Promise<Player>
  getInfo: () => Promise<PlayerInfo>
}

