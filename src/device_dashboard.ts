import { z } from "zod";
import { client } from "./infrai_client.js";

export const shipmentEvent = z.object({ shipment_id: z.string().min(1), device_id: z.string().min(1), status: z.enum(["in_transit", "delivered", "exception"]), occurred_at: z.string().datetime(), note: z.string().optional() });
export type ShipmentEvent = z.infer<typeof shipmentEvent>;

export async function streamStatus(event: ShipmentEvent, accountId: string) {
  const parsed = shipmentEvent.parse(event);
  const infrai = client();
  const channel = `shipment:${parsed.shipment_id}`;
  await infrai.realtime.channel.create({ channel, type: "public" });
  await infrai.realtime.publish({ channel, event: "device.status", data: parsed, account_id: accountId });
  await infrai.metrics.report({ type: "counter", name: "shipment_device_status", value: 1, tags: { status: parsed.status, shipment_id: parsed.shipment_id } });
  return { channel, status: parsed.status };
}

if (process.argv[1]?.endsWith("device_dashboard.ts")) {
  const sample: ShipmentEvent = { shipment_id: "order-1042", device_id: "tracker-7", status: "in_transit", occurred_at: new Date().toISOString() };
  streamStatus(sample, "storefront-account").then(console.log).catch((error) => { console.error(error); process.exitCode = 1; });
}
