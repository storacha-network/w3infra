# HTTP-UCAN Bridge

## Summary

We have implemented a "bridge" that allows w3up users to interact with the service
without implementing the UCAN invocation wire protocols. 

A user can submit an HTTP request like (simplified for clarity):

```
POST /bridge
X-Auth-Secret: uNGUyOTA2OTRlYjNlZDJjNjE3ZTRkNzBlYzJiN2RkYTM
Authorization: uOqJlcm9vdHOB2CpYJQABcRIggNKF1CtKV9n5k1T8575Uh8T5P-Ju8u9J4PMymVnXrC5ndmVyc2lvbgG-BQFxEiB-pJ_qmilXuN7XI0DMfWHFW_npviV1YPnne3fxx0Vx3Khhc1hE7aEDQKF3NP3YRysG_gzE7uF4T_-HFcSMWMDr2rOgCdGpnKtqP9hEuuMfjpz_1-rCHTkiIQnpELGw6wO5rWUuOfM8pgRhdmUwLjkuMWNhdHSGomNjYW5nc3BhY2UvKmR3aXRoeDhkaWQ6a2V5Ono2TWtyVG5aSEVNWkJ2MzI0SDJVeTdjdXI2SEdvcHl0bmZHOFd0QW8xMkxQckI5NKJjY2FuZ3N0b3JlLypkd2l0aHg4ZGlkOmtleTp6Nk1rclRuWkhFTVpCdjMyNEgyVXk3Y3VyNkhHb3B5dG5mRzhXdEFvMTJMUHJCOTSiY2Nhbmh1cGxvYWQvKmR3aXRoeDhkaWQ6a2V5Ono2TWtyVG5aSEVNWkJ2MzI0SDJVeTdjdXI2SEdvcHl0bmZHOFd0QW8xMkxQckI5NKJjY2FuaGFjY2Vzcy8qZHdpdGh4OGRpZDprZXk6ejZNa3JUblpIRU1aQnYzMjRIMlV5N2N1cjZIR29weXRuZkc4V3RBbzEyTFByQjk0omNjYW5qZmlsZWNvaW4vKmR3aXRoeDhkaWQ6a2V5Ono2TWtyVG5aSEVNWkJ2MzI0SDJVeTdjdXI2SEdvcHl0bmZHOFd0QW8xMkxQckI5NKJjY2FuZ3VzYWdlLypkd2l0aHg4ZGlkOmtleTp6Nk1rclRuWkhFTVpCdjMyNEgyVXk3Y3VyNkhHb3B5dG5mRzhXdEFvMTJMUHJCOTRjYXVkWCLtAUn0qM5JR33gEL3vJ0-FYRaYfKOWfY82JUvkwOHZahYVY2V4cBpnpqjmY2ZjdIGhZXNwYWNloWRuYW1lZnRyYXZpc2Npc3NYIu0Bsm6-NkeTTvIb1q1lweVyY_gHAXbO5r3JrlIrw6nlo2NjcHJmgNECAXESILbAasj0dgIrbhevRQieJFyjmwmxQ2ekaL9QG8Y2i7Gcp2FzWETtoQNAX5yt8ege1TlDd7_ETGviAPBStxgLnq1WaAqgoIRw4lJUk6ha88Wg23VBuNY-IQ380_ZaxxYnTuXf72OZsxEDDWF2ZTAuOS4xY2F0dIGiY2Nhbmt1cGxvYWQvbGlzdGR3aXRoeDhkaWQ6a2V5Ono2TWtyVG5aSEVNWkJ2MzI0SDJVeTdjdXI2SEdvcHl0bmZHOFd0QW8xMkxQckI5NGNhdWRYIu0BEtkc3siSUH7S0eTOj30FFnw7sSiNzFgxY4lOrUaGKbBjZXhwGmXO8PpjaXNzWCLtAUn0qM5JR33gEL3vJ0-FYRaYfKOWfY82JUvkwOHZahYVY3ByZoHYKlglAAFxEiB-pJ_qmilXuN7XI0DMfWHFW_npviV1YPnne3fxx0Vx3FkBcRIggNKF1CtKV9n5k1T8575Uh8T5P-Ju8u9J4PMymVnXrC6hanVjYW5AMC45LjHYKlglAAFxEiC2wGrI9HYCK24Xr0UIniRco5sJsUNnpGi_UBvGNouxnA
Content-Type: application/json
{
  tasks: [
    ["store/add", "did:key:z6Mkm5qHN9g9NQSGbBfL7iGp9sexdssioT4CzyVap9ATqGqX", {
        "link": "bagbaierah5sr5zt3tqgkrixptqzyerpxp5vwyjlx3n5frp2tbnr3clqrmrqa",
        "size": 42
    }],
    ["store/add", "did:key:z6Mkm5qHN9g9NQSGbBfL7iGp9sexdssioT4CzyVap9ATqGqX", {
        "link": "bafybeicajpuoxboivzka7cyft7okjf6vp43uk5udnedsrle6jews2cqj3a",
        "size": 789
    }]
  ]
}
```

And receive a dag-json-encoded list of UCAN bridge receipts like:

```json
[
  {
    "data": {
      "fx": {
        "fork": []
      },
      "iss": "did:web:staging.web3.storage",
      "meta": {},
      "out": {
        "ok": {
          "before": "bafybeiabommx77q4ltcolzsmyqykuk6tsnerkixr6lsoegrx7qejcfurhu",
          "results": [
            {
              "insertedAt": "2024-02-09T00:53:54.545Z",
              "root": {
                "/": "bafybeiabommx77q4ltcolzsmyqykuk6tsnerkixr6lsoegrx7qejcfurhu"
              },
              "shards": [
                {
                  "/": "bagbaierah5sr5zt3tqgkrixptqzyerpxp5vwyjlx3n5frp2tbnr3clqrmrqa"
                }
              ],
              "updatedAt": "2024-02-09T00:53:54.545Z"
            },
            {
              "insertedAt": "2024-02-16T05:11:35.173Z",
              "root": {
                "/": "bafybeicajpuoxboivzka7cyft7okjf6vp43uk5udnedsrle6jews2cqj3a"
              },
              "shards": [
                {
                  "/": "bagbaierahw552ajjkkxsvfgu5amm3o5bpzfhvrrl5vouwubwwk5wpbjiu5eq"
                }
              ],
              "updatedAt": "2024-02-16T05:11:35.173Z"
            }
          ],
          "size": 2
        }
      },
      "prf": [],
      "ran": {
        "/": "bafyreienff66mf7nse3rm2njikxlshja6d5dkr4fpnyzeik5l6vils6fvq"
      }
    },
    "sig": {
      "/": {
        "bytes": "7aEDQCiJYmYe9Gf25hv84NVN/fjN+udnT4Q65kVHFmQb1MPB2EmwDnR+S/TeYNkMxBdwIsNOKDwyTCqKOxvUhbWkGA8"
      }
    }
  }
]
```

A UCAN bridge receipt has two fields, `data` and `sig`:

`data` contains the result of an invocation (in the nested `out` field) along with information about the invocation.
`sig` is a signature over a CBOR-encoded version of the value of the `data` field. It can be verified as follows:

```javascript
import * as Signature from '@ipld/dag-ucan/signature'
import { ed25519 } from '@ucanto/principal'
import { CBOR } from '@ucanto/core'

...

const { data, sig } = bridgeReceipt
const signature = Signature.view(sig)
const valid = signature.verify(ed25519.Verifier.parse(data.iss), CBOR.encode(data))

```

### Authorization

The `X-Auth-Secret` and `Authorization` header values can be generated with the `bridge generate-tokens` command of `w3cli`:

```sh
$ w3 bridge generate-tokens did:key:z6Mkm5qHN9g9NQSGbBfL7iGp9sexdssioT4CzyVap9ATqGqX --expiration 1707264563641

X-Auth-Secret header: uNGUyOTA2OTRlYjNlZDJjNjE3ZTRkNzBlYzJiN2RkYTM=

Authorization header: uOqJlcm9vdHOB2CpYJQABcRIggNKF1CtKV9n5k1T8575Uh8T5P-Ju8u9J4PMymVnXrC5ndmVyc2lvbgG-BQFxEiB-pJ_qmilXuN7XI0DMfWHFW_npviV1YPnne3fxx0Vx3Khhc1hE7aEDQKF3NP3YRysG_gzE7uF4T_-HFcSMWMDr2rOgCdGpnKtqP9hEuuMfjpz_1-rCHTkiIQnpELGw6wO5rWUuOfM8pgRhdmUwLjkuMWNhdHSGomNjYW5nc3BhY2UvKmR3aXRoeDhkaWQ6a2V5Ono2TWtyVG5aSEVNWkJ2MzI0SDJVeTdjdXI2SEdvcHl0bmZHOFd0QW8xMkxQckI5NKJjY2FuZ3N0b3JlLypkd2l0aHg4ZGlkOmtleTp6Nk1rclRuWkhFTVpCdjMyNEgyVXk3Y3VyNkhHb3B5dG5mRzhXdEFvMTJMUHJCOTSiY2Nhbmh1cGxvYWQvKmR3aXRoeDhkaWQ6a2V5Ono2TWtyVG5aSEVNWkJ2MzI0SDJVeTdjdXI2SEdvcHl0bmZHOFd0QW8xMkxQckI5NKJjY2FuaGFjY2Vzcy8qZHdpdGh4OGRpZDprZXk6ejZNa3JUblpIRU1aQnYzMjRIMlV5N2N1cjZIR29weXRuZkc4V3RBbzEyTFByQjk0omNjYW5qZmlsZWNvaW4vKmR3aXRoeDhkaWQ6a2V5Ono2TWtyVG5aSEVNWkJ2MzI0SDJVeTdjdXI2SEdvcHl0bmZHOFd0QW8xMkxQckI5NKJjY2FuZ3VzYWdlLypkd2l0aHg4ZGlkOmtleTp6Nk1rclRuWkhFTVpCdjMyNEgyVXk3Y3VyNkhHb3B5dG5mRzhXdEFvMTJMUHJCOTRjYXVkWCLtAUn0qM5JR33gEL3vJ0-FYRaYfKOWfY82JUvkwOHZahYVY2V4cBpnpqjmY2ZjdIGhZXNwYWNloWRuYW1lZnRyYXZpc2Npc3NYIu0Bsm6-NkeTTvIb1q1lweVyY_gHAXbO5r3JrlIrw6nlo2NjcHJmgNECAXESILbAasj0dgIrbhevRQieJFyjmwmxQ2ekaL9QG8Y2i7Gcp2FzWETtoQNAX5yt8ege1TlDd7_ETGviAPBStxgLnq1WaAqgoIRw4lJUk6ha88Wg23VBuNY-IQ380_ZaxxYnTuXf72OZsxEDDWF2ZTAuOS4xY2F0dIGiY2Nhbmt1cGxvYWQvbGlzdGR3aXRoeDhkaWQ6a2V5Ono2TWtyVG5aSEVNWkJ2MzI0SDJVeTdjdXI2SEdvcHl0bmZHOFd0QW8xMkxQckI5NGNhdWRYIu0BEtkc3siSUH7S0eTOj30FFnw7sSiNzFgxY4lOrUaGKbBjZXhwGmXO8PpjaXNzWCLtAUn0qM5JR33gEL3vJ0-FYRaYfKOWfY82JUvkwOHZahYVY3ByZoHYKlglAAFxEiB-pJ_qmilXuN7XI0DMfWHFW_npviV1YPnne3fxx0Vx3FkBcRIggNKF1CtKV9n5k1T8575Uh8T5P-Ju8u9J4PMymVnXrC6hanVjYW5AMC45LjHYKlglAAFxEiC2wGrI9HYCK24Xr0UIniRco5sJsUNnpGi_UBvGNouxnA
```

`X-Auth-Secret` is a base64url-multibase-encoded Uint8Array of arbitrary length that will be used to derive an ed25519 principal as follows:

```typescript
import { sha256 } from '@ucanto/core'
import { ed25519 } from '@ucanto/principal'

async function deriveSigner(headerValue: string): Promise<ed25519.EdSigner> {
  const secret = base64url.decode(headerValue)
  const { digest } = await sha256.digest(secret)
  return await ed25519.Signer.derive(digest)
}
```

`Authorization` is an IPLD CAR [ed: unixfs encoded? need to understand Delegation archive format better] representing a UCAN delegation.
It should grant the principal identified by `X-Auth-Secret` appropriate capabilities
on the resource identified in the JSON body of the HTTP request.

### Request Format

The request body should be a JSON or CBOR-encoded map with one key named `tasks` whose value is an array of "task specifications" of the form:

```javascript
[command, subject, arguments]
```

`command` is the name of the capability to be invoked
`subject` is the DID of the resource the capability should be invoked against
`arguments` is a (possibly nested) map from string keys to arbitrary arguments

`command`, `subject` and `arguments` should be specified according to the capability you wish to invoke. 

`command` should be an "ability" string like `store/add` or `upload/add` and must be included in the set of abilities passed to the `--can` option of `w3 bridge generate-tokens`. By default, `--can` is set to `['upload/add', 'store/add']`.

`subject` MUST match the resource passed as the first option to `w3 bridge generate-tokens`.

Information about possible `arguments` for a particular ability can be found in https://github.com/web3-storage/specs/
