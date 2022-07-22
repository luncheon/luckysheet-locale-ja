import { parse } from "@swc/core";
import ja from "./index.js";

const loadEnglishLocaleModule = async () => {
  const response = await fetch("https://raw.githubusercontent.com/mengshukeji/Luckysheet/master/src/locale/en.js");
  const source = await response.text();
  return await parse(source);
};

const checkObject = (objectExpression, localeObject, prefix = "") => {
  if (typeof localeObject !== "object") {
    throw Error("localeObject is not an object");
  }
  for (const prop of objectExpression.properties) {
    if (prop.type !== "KeyValueProperty") {
      continue;
    }
    const key = prop.key.value;
    const value = localeObject[key];
    const path = prefix + key;
    switch (prop.value.type) {
      case "StringLiteral":
        if (typeof value !== "string") {
          console.log(`${path}: must be a string, en: "${prop.value.value}"`);
        }
        break;
      case "NumericLiteral":
        if (typeof value !== "number") {
          console.log(`${path}: must be a number, en: ${prop.value.value}`);
        }
        break;
      case "ArrayExpression":
        if (!Array.isArray(value)) {
          console.log(path, "must be an array");
        }
        break;
      case "ObjectExpression":
        if (path === 'fontFamily' || path === 'fontjson') {
          // ignore
        } else if (Object.getPrototypeOf(value) !== Object.prototype) {
          console.log(path, "must be an object");
        } else {
          checkObject(prop.value, value, path + ".");
        }
        break;
      default:
        console.log(path, prop);
        break;
    }
  }
};

const check = async () => {
  const module = await loadEnglishLocaleModule();
  if (module.type !== "Module" || module.body.length !== 1) {
    throw Error("en.js is not a valid module");
  }
  const body = module.body[0];
  if (body.type !== "ExportDefaultExpression" || body.expression.type !== "ObjectExpression") {
    throw Error("en.js does not export a valid object");
  }
  checkObject(body.expression, ja);
};

check();
