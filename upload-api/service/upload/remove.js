import * as Server from '@ucanto/server'
import * as Upload from '@web3-storage/capabilities/upload'

/**
 * @typedef {import('@web3-storage/capabilities/types').UploadRemove} UploadRemoveCapability
 * @typedef {import('../types').UploadRemoveResult} UploadRemoveResult
 * @typedef {import('@ucanto/interface').Failure} Failure
 */

/**
 * @param {import('../types').UploadServiceContext} context
 * @returns {import('@ucanto/interface').ServiceMethod<UploadRemoveCapability, UploadRemoveResult | undefined, Failure>}
 */
export function uploadRemoveProvider(context) {
  return Server.provide(
    Upload.remove,
    async ({ capability }) => {
      const { root } = capability.nb

      // Only use capability account for now to check if account is registered.
      // This must change to access account/info!!
      // We need to use https://github.com/web3-storage/w3protocol/blob/9d4b5bec1f0e870233b071ecb1c7a1e09189624b/packages/access/src/agent.js#L270
      const space = Server.DID.parse(capability.with).did()

      return context.uploadTable.remove(space, root)
  })
}