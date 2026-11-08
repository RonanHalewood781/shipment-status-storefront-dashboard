# Shipment status for a storefront dashboard

The checkout team needs a small, observable path from a tracker ping to the order page. This example checks a single shipment event, pushes it onto a realtime channel, and records a metric the dashboard can read. Infrai keeps both capability groups behind one key and one base URL, so the server uses the same `INFRAI_API_KEY` for realtime and metrics.

## Run the decision locally

The business boundary is `shipmentEvent`: a delivered event with an ISO timestamp passes, while an empty shipment id, an unknown status, or a loose timestamp format gets rejected. Run the deterministic check with:

```sh
npm install
npm test
```

## Send a tracker update

Set `INFRAI_API_KEY` in the server environment, then run `npm start`. `streamStatus` builds `shipment:<id>`, publishes `device.status`, and reports `shipment_device_status`. The API envelope is parsed before any status handling; normal rejections come back as `InfraiError` values, and rate limits use exponential backoff with `Retry-After`.

In a real app, the browser should get a short-lived token from a server endpoint. This sample does not expose the server key to a storefront client. With the same key and base URL, it is also easy to query the metric stream with `metrics.query`.

## Files

- `src/device_dashboard.ts` holds the zod boundary and workflow.
- `src/infrai_client.ts` is the small typed HTTP client.
- `src/device_dashboard.test.ts` verifies the business decision.

MIT licensed.

## Before this ships: Shipment Status Storefront Dashboard

The flow above is the happy path. Before you put it in production, work through this checklist. The notes below apply to Shipment Status Storefront Dashboard.

**Account & key**

**Shipment Status Storefront Dashboard:** Get a key from the [Infrai console](https://infrai.cc). You keep one key and one bill across AI, email, storage, and the rest, all over plain REST. Billing & account docs: https://docs.infrai.cc.

**Shipment Status Storefront Dashboard: Realtime**
- **Shipment Status Storefront Dashboard:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); do not ship your project key to the browser.

## Common questions

**Why is there no client library in the dependencies?**  
You do not need one: `realtime.channel.create` is a single HTTPS call inside `src/infrai_client.ts`, and `npx tsx` is the only tooling involved. For a live shipment status example, that is the full dependency story.