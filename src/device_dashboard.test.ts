import assert from "node:assert/strict";
import { shipmentEvent } from "./device_dashboard.js";

const accepted = shipmentEvent.safeParse({ shipment_id: "order-1", device_id: "tracker-1", status: "delivered", occurred_at: "2026-01-02T03:04:05.000Z" });
assert.equal(accepted.success, true);
const rejected = shipmentEvent.safeParse({ shipment_id: "", device_id: "tracker-1", status: "unknown", occurred_at: "yesterday" });
assert.equal(rejected.success, false);
console.log("shipment event boundary checks passed");
