import {
  DescribeTableCommand,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { Failure } from '@ucanto/server'
import { marshall } from '@aws-sdk/util-dynamodb'

/**
 * @typedef {import('../types').SubscriptionTable} SubscriptionTable
 * @typedef {import('../types').UnstableSubscriptionTable} UnstableSubscriptionTable
 * @typedef {import('../types').SubscriptionInput} SubscriptionInput
 * @typedef {import('../types').Subscription} Subscription
 */

export class ConflictError extends Failure {
  /**
   * @param {object} input
   * @param {string} input.message
   */
  constructor({ message }) {
    super(message)
    this.name = 'ConflictError'
  }
}

/**
 * Abstraction layer to handle operations on Store Table.
 *
 * @param {string} region
 * @param {string} tableName
 * @param {object} [options]
 * @param {string} [options.endpoint]
 */
export function createSubscriptionTable (region, tableName, options = {}) {
  const dynamoDb = new DynamoDBClient({
    region,
    endpoint: options.endpoint,
  })

  return useSubscriptionTable(dynamoDb, tableName)
}

/**
 * @param {DynamoDBClient} dynamoDb
 * @param {string} tableName
 * @returns {UnstableSubscriptionTable}
 */
export function useSubscriptionTable (dynamoDb, tableName) {
  return {
    /**
     * Record the fact that a subscription is consuming a provider via a subscription
     *
     * @param {SubscriptionInput} item
     * @returns {Promise<Subscription>}
     */
    insert: async ({ customer, provider, subscription, cause }) => {
      const insertedAt = new Date().toISOString()

      const item = {
        customer,
        provider,
        subscription,
        cause: cause.toString(),
        insertedAt,
      }
      try {
        await dynamoDb.send(new PutItemCommand({
          TableName: tableName,
          ConditionExpression: `attribute_not_exists(consumer) AND attribute_not_exists(subscription)`,
          Item: marshall(item, { removeUndefinedValues: true }),
        }))
        return {}
      } catch (error) {
        const error_ = error instanceof Error && error.message === 'The conditional request failed' ? new ConflictError({
            message: `Customer ${item.customer} cannot be given a subscription for ${item.provider}: it already has a subscription`
          }) : error;
        throw error_;
      }
    },

    /**
     * get number of stored items
     */
    count: async () => {
      const result = await dynamoDb.send(new DescribeTableCommand({
        TableName: tableName
      }))

      return BigInt(result.Table?.ItemCount ?? -1)
    },

    /**
     * !!! the following methods are unstable and may be changed at any time !!!
     * !!!      they are included here for testing and design purposes       !!!
     */

    findCustomersByProvider: async (provider) => {
      const cmd = new QueryCommand({
        TableName: tableName,
        IndexName: 'provider',
        KeyConditions: {
          provider: {
            ComparisonOperator: 'EQ',
            AttributeValueList: [{ S: provider }]
          }
        },
        AttributesToGet: ['customer']
      })
      const response = await dynamoDb.send(cmd)
      if (response.Items) {
        return response.Items.map(item => /** @type{import('@ucanto/interface').DID} */ (item.customer.S))
      } else {
        return []
      }
    }
  }
}