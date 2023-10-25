import { Result, Failure } from '@ucanto/interface'
import {
  CustomerStore,
  StorePutter,
  StoreGetter,
  CustomerBillingQueue,
  Customer,
  CustomerBillingInstruction,
  DecodeFailure,
  QueueOperationFailure,
  SpaceBillingQueue,
  SpaceBillingInstruction,
  SubscriptionStore,
  ConsumerStore,
  Subscription,
  Consumer,
  SpaceDiffStore,
  SpaceSnapshotStore,
  UsageStore,
  UsageKey,
  Usage
} from '../../lib/api.js'

export interface BillingCronTestContext {
  customerStore: CustomerStore & StorePutter<Customer>
  customerBillingQueue: CustomerBillingQueue & QueueRemover<CustomerBillingInstruction>
}

export interface CustomerBillingQueueTestContext {
  subscriptionStore: SubscriptionStore & StorePutter<Subscription>
  consumerStore: ConsumerStore & StorePutter<Consumer>
  spaceBillingQueue: SpaceBillingQueue & QueueRemover<SpaceBillingInstruction>
}

export interface SpaceBillingQueueTestContext {
  spaceDiffStore: SpaceDiffStore
  spaceSnapshotStore: SpaceSnapshotStore
  usageStore: UsageStore & StoreGetter<UsageKey, Usage>
}

export type TestContext =
  & BillingCronTestContext
  & CustomerBillingQueueTestContext
  & SpaceBillingQueueTestContext

/** QueueRemover can remove items from the head of the queue. */
export interface QueueRemover<T> {
  /** Remove an item from the head of the queue. */
  remove: () => Promise<Result<T, EndOfQueue|DecodeFailure|QueueOperationFailure>>
}

/** EndOfQueue is a failure that occurs when there are no messages in a queue. */
export interface EndOfQueue extends Failure {
  name: 'EndOfQueue'
}

export type TestSuite<C> =
  Record<string, (assert: typeof import('entail').assert, ctx: C) => unknown>
