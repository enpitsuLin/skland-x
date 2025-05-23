export * from './building'
export * from './character'
export * from './client'
export * from './player'

export interface SklandResponse<T> {
  code: number
  message: string
  data: T
}

export interface HypergrayphonResponse<Data, Message = string> {
  status: string
  type: string
  msg: Message
  data: Data
}
