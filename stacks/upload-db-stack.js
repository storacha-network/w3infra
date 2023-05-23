import { Table } from '@serverless-stack/resources'

import {
  storeTableProps,
  uploadTableProps,
  provisionTableProps,
  delegationTableProps
} from '../upload-api/tables/index.js'
import {
  adminMetricsTableProps,
  spaceMetricsTableProps
} from '../ucan-invocation/tables/index.js'
import { setupSentry } from './config.js'

/**
 * @param {import('@serverless-stack/resources').StackContext} properties
 */
export function UploadDbStack({ stack, app }) {

  // Setup app monitoring with Sentry
  setupSentry(app, stack)

  /**
   * This table takes a stored CAR and makes an entry in the store table
   * Used by the store/* service capabilities.
   */
   const storeTable = new Table(stack, 'store', storeTableProps)

  /**
   * This table maps stored CAR files (shards) to an upload root cid.
   * Used by the upload/* capabilities.
   */
  const uploadTable = new Table(stack, 'upload', uploadTableProps)

  /**
   * This table tracks space provisioning.
   */
  const provisionTable = new Table(stack, 'provision', provisionTableProps)

  /**
   * This table indexes delegations.
   */
  const delegationTable = new Table(stack, 'delegation', delegationTableProps)

  /**
   * This table tracks w3 wider metrics.
   */
  const adminMetricsTable = new Table(stack, 'admin-metrics', adminMetricsTableProps)

  /**
   * This table tracks metrics per space.
   */
  const spaceMetricsTable = new Table(stack, 'space-metrics', spaceMetricsTableProps)

  return {
    storeTable,
    uploadTable,
    provisionTable,
    delegationTable,
    adminMetricsTable,
    spaceMetricsTable
  }
}
