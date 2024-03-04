import {
  Bucket,
  KinesisStream,
} from 'sst/constructs'
import { PolicyStatement, StarPrincipal, Effect } from 'aws-cdk-lib/aws-iam'

import {
  getBucketConfig,
  getKinesisStreamConfig,
  setupSentry
} from './config.js'

/**
 * @param {import('sst/constructs').StackContext} properties
 */
export function UcanInvocationStack({ stack, app }) {
  // Setup app monitoring with Sentry
  setupSentry(app, stack)

  const workflowBucket = new Bucket(stack, 'workflow-store', {
    cors: true,
    cdk: {
      bucket: {
        ...getBucketConfig('workflow-store', app.stage),
        // change the defaults accordingly to allow access via new Policy
        blockPublicAccess: {
          blockPublicAcls: true,
          ignorePublicAcls: true,
          restrictPublicBuckets: false,
          blockPublicPolicy: false,
        }
      },
    }
  })
  // Make bucket public for `s3:GetObject` command
  workflowBucket.cdk.bucket.addToResourcePolicy(
    new PolicyStatement({
      actions: ['s3:GetObject'],
      effect: Effect.ALLOW,
      principals: [new StarPrincipal()],
      resources: [workflowBucket.cdk.bucket.arnForObjects('*')],
    })
  )

  const invocationBucket = new Bucket(stack, 'invocation-store', {
    cors: true,
    cdk: {
      bucket: getBucketConfig('invocation-store', app.stage)
    }
  })
  const taskBucket = new Bucket(stack, 'task-store', {
    cors: true,
    cdk: {
      bucket: getBucketConfig('task-store', app.stage)
    }
  })

  // TODO: keep for historical content that we might want to process
  new Bucket(stack, 'ucan-store', {
    cors: true,
    cdk: {
      bucket: getBucketConfig('ucan-store', app.stage)
    }
  })

  // TODO: keep for historical content that we might want to process
  // only needed for production
  if (stack.stage === 'production' || stack.stage === 'staging') {
    new KinesisStream(stack, 'ucan-stream', {
      cdk: {
        stream: getKinesisStreamConfig(stack)
      },
    })
  }

  // create a kinesis stream
  const ucanStream = new KinesisStream(stack, 'ucan-stream-v2', {
    cdk: {
      stream: getKinesisStreamConfig(stack)
    }
  })

  return {
    invocationBucket,
    taskBucket,
    workflowBucket,
    ucanStream
  }
}
