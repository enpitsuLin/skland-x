import type { ClientCollections } from '../../types'
import { clientCtx, useClientContext } from '../ctx'
import { buildGameCollection } from './game'
import { buildHypergryphCollection } from './hypergrayph'
import { buildPlayerCollection } from './player'

export function buildCollections(): ClientCollections {
  const context = useClientContext()
  return clientCtx.call(context, () => {
    return {
      hypergryph: buildHypergryphCollection(),
      score: {},
      player: buildPlayerCollection(),
      game: buildGameCollection(),
    }
  })
}
