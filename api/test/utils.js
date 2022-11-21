import { customAlphabet } from 'nanoid'
import { GenericContainer as Container } from 'testcontainers'
import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import * as Signer from '@ucanto/principal/ed25519'
import * as Server from '@ucanto/server'
import { CAR, CBOR } from '@ucanto/transport'
import * as HTTP from 'http'

/**
 * @typedef {Partial<{
 *   voucher: Partial<import('@web3-storage/access/types').Service['voucher']>
 *   account: Partial<import('@web3-storage/access/types').Service['account']>
 * }>} PartialAccessService
 * @typedef {ReturnType<mockAccessService>} MockedAccessService
 * @typedef {{
 *   serviceDID: string
 *   serviceURL: string
 *   setServiceImpl: (impl: PartialAccessService) => void
 *   server: import('@ucanto/server').ServerView<MockedAccessService>
 *   httpServer: HTTP.Server
 * }} MockAccess
 */

/**
 * @param {object} [opts]
 * @param {number} [opts.port]
 * @param {string} [opts.region]
 */
export async function createDynamodDb(opts = {}) {
  const port = opts.port || 8000
  const region = opts.region || 'us-west-2'
  const dbContainer = await new Container('amazon/dynamodb-local:latest')
    .withExposedPorts(port)
    .start()

  const endpoint = `http://${dbContainer.getHost()}:${dbContainer.getMappedPort(8000)}`
  return {
    client: new DynamoDBClient({
      region,
      endpoint
    }),
    endpoint
  }
}

/**
 * @param {object} [opts]
 * @param {number} [opts.port]
 * @param {string} [opts.region]
 */
export async function createS3(opts = {}) {
  const region = opts.region || 'us-west-2'
  const port = opts.port || 9000

  const minio = await new Container('quay.io/minio/minio')
    .withCmd(['server', '/data'])
    .withExposedPorts(port)
    .start()

  const clientOpts = {
    endpoint: `http://${minio.getHost()}:${minio.getMappedPort(port)}`,
    forcePathStyle: true,
    region,
    credentials: {
      accessKeyId: 'minioadmin',
      secretAccessKey: 'minioadmin',
    },
  }

  return {
    client: new S3Client(clientOpts),
    clientOpts
  }
}

/**
 * @param {S3Client} s3
 */
export async function createBucket(s3) {
  const id = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)
  const Bucket = id()
  await s3.send(new CreateBucketCommand({ Bucket }))
  return Bucket
}

/**
 * @param {any} ctx 
 */
export function getSigningOptions(ctx) {
  return {
    region: ctx.region,
    secretAccessKey: ctx.secretAccessKey,
    accessKeyId: ctx.accessKeyId,
    sessionToken: ctx.sessionToken,
    bucket: ctx.bucketName,
  }
}

/** @returns {Promise<MockAccess>} */
export async function createAccess () {
  const signer = await Signer.generate()
  const server = Server.create({
    id: signer,
    service: mockAccessService(),
    decoder: CAR,
    encoder: CBOR,
  })

  const httpServer = HTTP.createServer(async (request, response) => {
    try {
      const chunks = []
      for await (const chunk of request) {
        chunks.push(chunk)
      }
      const { headers, body } = await server.request({
        // @ts-expect-error
        headers: request.headers,
        body: Buffer.concat(chunks),
      })
      response.writeHead(200, headers)
      response.write(body)
    } catch (err) {
      console.error(err)
      response.statusCode = 500
    } finally {
      response.end()
    }
  })

  const serviceDID = signer.did()
  const serviceURL = await new Promise(resolve => {
    httpServer.listen(() => {
      // @ts-expect-error
      const { address, port } = httpServer.address()
      const serviceURL = `http://${address}:${port}`
      resolve(serviceURL)
    })
  })
  /** @param {PartialAccessService} impl */
  const setServiceImpl = impl => Object.assign(server.service, mockAccessService(impl))

  return { serviceDID, serviceURL, setServiceImpl, server, httpServer }
}

/** @param {PartialAccessService} [impl] */
function mockAccessService (impl = {}) {
  const notImplemented = () => { throw new Server.Failure('not implemented') }
  return {
    voucher: {
      claim: withCallCount(impl.voucher?.claim ?? notImplemented),
      redeem: withCallCount(impl.voucher?.redeem ?? notImplemented),
    },
    account: {
      info: withCallCount(impl.account?.info ?? notImplemented),
      'recover-validation': withCallCount(impl.account?.['recover-validation'] ?? notImplemented),
    }
  }
}

/**
 * @template {Function} T
 * @param {T} fn
 */
function withCallCount(fn) {
  /** @param {T extends (...args: infer A) => any ? A : never} args */
  const countedFn = (...args) => {
    countedFn.called = true
    countedFn.callCount++
    return fn(...args)
  }
  countedFn.called = false
  countedFn.callCount = 0
  return countedFn
}
