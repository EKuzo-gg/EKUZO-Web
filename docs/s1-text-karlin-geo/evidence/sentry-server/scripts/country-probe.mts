import { parseGeoHeader } from "../../../../../lib/seasonOneGeo.ts";
const b = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64");
console.log(JSON.stringify(parseGeoHeader(b({ city: "A", country: { code: 'U"S\\' }, subdivision: { code: "TX" }, postalCode: '78"7\n57' }))));
