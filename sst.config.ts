import type { SSTConfig } from 'sst'
import { Tags, RemovalPolicy } from 'aws-cdk-lib'

import { UploadApiStack } from './stacks/upload-api-stack.js'
import { UploadDbStack } from './stacks/upload-db-stack.js'
import { UcanInvocationStack } from './stacks/ucan-invocation-stack.js'
import { BusStack } from './stacks/bus-stack.js'
import { CarparkStack } from './stacks/carpark-stack.js'
import { SatnavStack } from './stacks/satnav-stack.js'
import { ReplicatorStack } from './stacks/replicator-stack.js'
import { isPrBuild } from './stacks/config.js'

export default {
  config(_input) {
    return {
      name: 'w3infra',
      region: 'us-west-2',
    }
  },
  stacks(app) {
    if (isPrBuild(app.stage)) {
      // destroy buckets and tables for PR builds
      app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY)
    }

    app.setDefaultFunctionProps({
      runtime: 'nodejs16.x',
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
      },
      nodejs: {
        format: 'esm',
        sourcemap: true,
      },
    })

    app.stack(BusStack)
    app.stack(UploadDbStack)
    app.stack(UcanInvocationStack)
    app.stack(CarparkStack)
    app.stack(SatnavStack)
    app.stack(UploadApiStack)
    app.stack(ReplicatorStack)

    // tags let us discover all the aws resource costs incurred by this app
    // see: https://docs.sst.dev/advanced/tagging-resources
    Tags.of(app).add('Project', 'w3infra')
    Tags.of(app).add('Repository', 'https://github.com/web3-storage/w3infra')
    Tags.of(app).add('Environment', `${app.stage}`)
    Tags.of(app).add('ManagedBy', 'SST')
  },
} satisfies SSTConfig
