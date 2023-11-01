import * as Link from 'multiformats/link'
import { DecodeFailure, EncodeFailure, Schema } from './lib.js'

/**
 * @typedef {import('../lib/api').Subscription} Subscription
 * @typedef {import('../types').InferStoreRecord<Subscription>} SubscriptionStoreRecord
 * @typedef {import('../lib/api').SubscriptionKey} SubscriptionKey
 * @typedef {import('../types').InferStoreRecord<SubscriptionKey>} SubscriptionKeyStoreRecord
 * @typedef {import('../types').StoreRecord} StoreRecord
 * @typedef {import('../lib/api').SubscriptionListKey} SubscriptionListKey
 * @typedef {import('../types').InferStoreRecord<SubscriptionListKey>} SubscriptionListKeyStoreRecord
 * @typedef {Pick<Subscription, 'customer'|'provider'|'subscription'|'cause'>} SubscriptionList
 */

const schema = Schema.struct({
  customer: Schema.did({ method: 'mailto' }),
  provider: Schema.did({ method: 'web' }),
  subscription: Schema.text(),
  cause: Schema.link({ version: 1 }),
  insertedAt: Schema.date(),
  updatedAt: Schema.date()
})

/** @type {import('../lib/api').Validator<Subscription>} */
export const validate = input => schema.read(input)

/** @type {import('../lib/api').Encoder<Subscription, SubscriptionStoreRecord>} */
export const encode = input => {
  try {
    return {
      ok: {
        customer: input.customer,
        provider: input.provider,
        subscription: input.subscription,
        cause: input.cause.toString(),
        insertedAt: input.insertedAt.toISOString(),
        updatedAt: input.updatedAt.toISOString()
      }
    }
  } catch (/** @type {any} */ err) {
    return {
      error: new EncodeFailure(`encoding subscription record: ${err.message}`)
    }
  }
}

/** @type {import('../lib/api').Encoder<SubscriptionKey, SubscriptionKeyStoreRecord>} */
export const encodeKey = input => ({
  ok: {
    provider: input.provider,
    subscription: input.subscription
  }
})

/** @type {import('../lib/api').Decoder<StoreRecord, Subscription>} */
export const decode = input => {
  try {
    return {
      ok: {
        customer: Schema.did({ method: 'mailto' }).from(input.customer),
        provider: Schema.did({ method: 'web' }).from(input.provider),
        subscription: /** @type {string} */ (input.subscription),
        cause: Link.parse(/** @type {string} */ (input.cause)),
        insertedAt: new Date(input.insertedAt),
        updatedAt: new Date(input.updatedAt)
      }
    }
  } catch (/** @type {any} */ err) {
    return {
      error: new DecodeFailure(`decoding subscription record: ${err.message}`)
    }
  }
}

/** Encoders/decoders for listings. */
export const lister = {
  /** @type {import('../lib/api').Encoder<SubscriptionListKey, SubscriptionListKeyStoreRecord>} */
  encodeKey: input => ({ ok: { customer: input.customer } }),
  /** @type {import('../lib/api').Decoder<StoreRecord, SubscriptionList>} */
  decode: input => {
    try {
      return {
        ok: {
          customer: Schema.did({ method: 'mailto' }).from(input.customer),
          provider: Schema.did({ method: 'web' }).from(input.provider),
          subscription: String(input.subscription),
          cause: Link.parse(String(input.cause))
        }
      }
    } catch (/** @type {any} */ err) {
      return {
        error: new DecodeFailure(`decoding subscription record: ${err.message}`)
      }
    }
  }
}
