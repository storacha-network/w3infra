import { StoreOperationFailed } from '@web3-storage/filecoin-api/errors'
import * as Store from '../../upload-api/stores/agent/store.js'
import { getS3Client } from '../../lib/aws/s3.js'

/**
 * Abstraction layer with Factory to perform operations on bucket storing
 * handled Tasks and their indexes.
 *
 * @param {string} region
 * @param {string} invocationBucketName
 * @param {string} workflowBucketName
 * @param {import('@aws-sdk/client-s3').ServiceInputTypes} [options]
 */
export function createTaskStore(region, invocationBucketName, workflowBucketName, options = {}) {
  const s3client = getS3Client({
    region,
    ...options,
  })
  return useTaskStore(s3client, invocationBucketName, workflowBucketName)
}

/**
 * @param {import('@aws-sdk/client-s3').S3Client} s3client
 * @param {string} invocationBucketName
 * @param {string} workflowBucketName
 * @returns {import('@web3-storage/filecoin-api/storefront/api').TaskStore}
 */
export const useTaskStore = (s3client, invocationBucketName, workflowBucketName) => {
  const store = Store.open({
    connection: { channel: s3client },
    region: typeof s3client.config.region === 'string' ? s3client.config.region : 'us-west-2',
    buckets: {
      index: { name: invocationBucketName },
      message: { name: workflowBucketName },
    }
  })

  return {
    put: async (record) => {
      return {
        error: new StoreOperationFailed('no new task should be put by storefront')
      }
    },
    get: (taskCid) =>
        // @ts-expect-error - need to align RecordNotFoundError
        Store.getInvocation(store, taskCid),
    has: async (record) => {
      return {
        error: new StoreOperationFailed('no task should checked by storefront')
      }
    }
  }
}
