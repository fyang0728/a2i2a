import { arrayToJson } from './utils';
const jsonc = require('typeof-jsonc');

export default function fieldParse(fileds: any, prefixName: string) {
  let newFileds: any[] = Object.values(fileds);
  if (newFileds.length === 2) {
    newFileds = newFileds[0].concat(newFileds[1]);
  } else if (newFileds.length === 1) {
    newFileds = newFileds[0];
  }
  const res = arrayToJson(newFileds);
  const response = jsonc.typeofJsonc(JSON.stringify(res), '', {
    prefix: prefixName,
    addExport: true,
    disallowComments: false,
  });
  return response;
}
