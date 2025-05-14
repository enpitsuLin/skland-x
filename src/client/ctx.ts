import type { $Fetch } from 'ofetch'
import type { Storage } from 'unstorage'
import { createContext } from 'unctx'

export const clientCtx = createContext<{
  storage: Storage<string>
  $fetch: $Fetch
}>()

export const useClientContext = clientCtx.use
