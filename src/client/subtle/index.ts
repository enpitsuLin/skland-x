import type { ClientSubtle } from '../../types'
import { clientCtx, useClientContext } from '../ctx'
import { buildSubtleGame } from './game'
import { buildSubtleHypergryph } from './hypergrayph'
import { buildSubtlePlayer } from './player'

export function buildSubtle(): ClientSubtle {
  const context = useClientContext()
  return clientCtx.call(context, () => {
    return {
      hypergryph: buildSubtleHypergryph(),
      score: {},
      player: buildSubtlePlayer(),
      game: buildSubtleGame(),
    }
  })
}
