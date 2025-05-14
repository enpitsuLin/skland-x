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
  signIn: (authorizeCode: string) => Promise<void>
  refresh: () => Promise<void>
  subtle: ClientSubtle
  storage: Storage<string>
}

export interface ClientSubtle {
  /** 
   * 鹰角通行证相关
   *
   * 提供在没有森空岛授权凭证的情况下，通过鹰角通行证获取森空岛登录的授权凭证的一些方式
   */
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
   * @param token 鹰角网络通行证账号的登录凭证 authorize_code
   * @return 返回可以用于 `signIn()`的 authorize_code 参数
   */
  grantAuthorizeCode: (token: string) => Promise<{ code: string, uid: string }>
}

export interface ClientScore {

}

export interface ClientPlayer {
  getBinding: () => Promise<Player>
  getInfo: () => Promise<PlayerInfo>
}

