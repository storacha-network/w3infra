import * as StoreCaps from '@web3-storage/capabilities/store'

/**
 * Filters UCAN stream messages that are receipts for invocations that alter
 * the store size for a resource and extracts the relevant information about
 * the delta.
 *
 * @param {import('./api.js').UcanStreamMessage[]} messages
 * @param {{ storeTable: Pick<import('@web3-storage/upload-api').StoreTable, 'exists'> }} ctx
 * @returns {Promise<import('./api.js').UsageDelta[]>}
 */
export const findSpaceUsageDeltas = async (messages, ctx) => {
  const deltas = []
  for (const message of messages) {
    if (!isReceipt(message)) continue

    /** @type {number|undefined} */
    let size
    if (isReceiptForCapability(message, StoreCaps.add) && isStoreAddSuccess(message.out)) {
      // If status is done, we need to check if the item is stored in _this_
      // space or not. If it is, then there is no delta.
      if (message.out.ok.status === 'done') {
        const { with: space, link } = message.out.ok
        if (await ctx.storeTable.exists(space, link)) continue
      }
      size = message.value.att[0].nb?.size
    } else if (isReceiptForCapability(message, StoreCaps.remove) && isStoreRemoveSuccess(message.out)) {
      size = -message.out.ok.size
    }

    // message is not a valid store/add or store/remove receipt
    if (size == null) {
      continue
    }

    /** @type {import('./api.js').UsageDelta} */
    const delta = {
      resource: /** @type {import('@ucanto/interface').DID} */ (message.value.att[0].with),
      cause: message.invocationCid,
      delta: size,
      // TODO: use receipt timestamp per https://github.com/web3-storage/w3up/issues/970
      receiptAt: message.ts
    }
    deltas.push(delta)
  }
  return deltas
}

/**
 * Attributes a raw usage delta to a customer and stores the collected
 * information in the space diff store.
 *
 * Space diffs are keyed by `customer`, `provider`, `space` and `cause` so
 * multiple calls to this function with the same data must not add _another_
 * record to the store.
 *
 * @param {import('./api.js').UsageDelta} delta
 * @param {{
 *   spaceDiffStore: import('./api').SpaceDiffStore
 *   consumerStore: import('./api').ConsumerStore
 * }} ctx
 * @returns {Promise<import('@ucanto/interface').Result<import('@ucanto/interface').Unit>>}
 */
export const storeSpaceUsageDelta = async (delta, ctx) => {
  const consumerList = await ctx.consumerStore.list({ consumer: delta.resource })
  if (consumerList.error) return consumerList

  // There should only be one subscription per provider, but in theory you
  // could have multiple providers for the same consumer (space).
  for (const consumer of consumerList.ok.results) {
    const spaceDiffPut = await ctx.spaceDiffStore.put({
      provider: consumer.provider,
      subscription: consumer.subscription,
      space: delta.resource,
      cause: delta.cause,
      delta: delta.delta,
      receiptAt: delta.receiptAt,
      insertedAt: new Date()
    })
    if (spaceDiffPut.error) return spaceDiffPut
  }

  return { ok: {} }
}

/**
 * @param {import('./api').UcanStreamMessage} m
 * @returns {m is import('./api').UcanReceiptMessage}
 */
const isReceipt = m => m.type === 'receipt'

/**
 * @param {import('@ucanto/interface').Result} r
 * @returns {r is { ok: import('@web3-storage/capabilities/types').StoreAddSuccess }}
 */
const isStoreAddSuccess = r =>
  !r.error &&
  r.ok != null &&
  typeof r.ok === 'object' &&
  'status' in r.ok &&
  (r.ok.status === 'done' || r.ok.status === 'upload')

/**
 * @param {import('@ucanto/interface').Result} r
 * @returns {r is { ok: import('@web3-storage/capabilities/types').StoreRemoveSuccess }}
 */
const isStoreRemoveSuccess = r =>
  !r.error &&
  r.ok != null &&
  typeof r.ok === 'object' &&
  'size' in r.ok

/**
 * @template {import('@ucanto/interface').Ability} Can
 * @template {import('@ucanto/interface').Unit} Caveats
 * @param {import('./api').UcanReceiptMessage} m
 * @param {import('@ucanto/interface').TheCapabilityParser<import('@ucanto/interface').CapabilityMatch<Can, import('@ucanto/interface').Resource, Caveats>>} cap
 * @returns {m is import('./api').UcanReceiptMessage<[import('@ucanto/interface').Capability<Can, import('@ucanto/interface').Resource, Caveats>]>}
 */
const isReceiptForCapability = (m, cap) => m.value.att.some(c => c.can === cap.can)
