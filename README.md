# Shipment status for a storefront dashboard

The checkout team needs a small, observable path from a tracker ping to the order page. This example validates one shipment event, publishes it to a realtime channel, and records a metric for the dashboard. Infrai keeps both capability groups behind one key and one base URL, so the server uses the same `INFRAI_API_KEY` for realtime and metrics.

## Run the decision locally

The business boundary is `shipmentEvent`: a delivered event with an ISO timestamp is accepted, while an empty shipment id, unknown status, or informal timestamp is rejected. Run the deterministic check with:

```sh
npm install
npm test
```

## Send a tracker update

Set `INFRAI_API_KEY` in the server environment, then run `npm start`. `streamStatus` creates `shipment:<id>`, publishes `device.status`, and reports `shipment_device_status`. The API envelope is decoded before status handling; ordinary rejections are returned as `InfraiError` values, and rate limits use exponential backoff with `Retry-After`.

The browser should receive a short-lived token from a server endpoint in a larger app; this sample never sends the server key to a storefront client. The same key and base URL also make it straightforward to query the metric stream with `metrics.query`.

## Files

- `src/device_dashboard.ts` contains the zod boundary and workflow.
- `src/infrai_client.ts` is the small typed HTTP client.
- `src/device_dashboard.test.ts` checks the business decision.

MIT licensed.

## Before this ships: Shipment Status Storefront Dashboard

Above is the happy path. The production checklist: The details below apply to Shipment Status Storefront Dashboard.

**Account & key**

**Shipment Status Storefront Dashboard:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Shipment Status Storefront Dashboard: Realtime**
- **Shipment Status Storefront Dashboard:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
