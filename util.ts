/*!
   Copyright 2018 Propel http://propel.site/.  All rights reserved.
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

// If you use the eval function indirectly, by invoking it via a reference
// other than eval, as of ECMAScript 5 it works in the global scope rather than
// the local scope. This means, for instance, that function declarations create
// global functions, and that the code being evaluated doesn't have access to
// local variables within the scope where it's being called.
export const globalEval = eval;
export const global = globalEval("this");
export const IS_WEB = global.window !== undefined;
export const IS_NODE = !IS_WEB;
// Parcel tries to be smart and replaces the process and Buffer object.
export const process = IS_NODE ? globalEval("process") : null;
// tslint:disable-next-line:variable-name
export const Buffer = IS_NODE ? globalEval("Buffer") : null;

if (IS_NODE) {
  process.on("unhandledRejection", (e: Error) => {
    throw e;
  });
}

// tslint:disable-next-line:no-any
export function assertEqual(actual: any, expected: any, msg?: string) {
  if (!msg) { msg = `actual: ${actual} expected: ${expected}`; }
  if (!equal(actual, expected)) {
    console.error(
      "assertEqual failed. actual = ", actual, "expected =", expected);
    throw new Error(msg);
  }
}

export function assert(expr: boolean, msg = "") {
  if (!expr) {
    throw new Error(msg);
  }
}

// tslint:disable-next-line:no-any
export function equal(c: any, d: any): boolean {
  const seen = new Map();
  return (function compare(a, b) {
    if (a === b) {
      return true;
    }
    if (typeof a === "number" && typeof b === "number" &&
        isNaN(a) && isNaN(b)) {
      return true;
    }
    if (a && typeof a === "object" && b && typeof b === "object") {
      if (seen.get(a) === b) {
        return true;
      }
      if (Object.keys(a).length !== Object.keys(b).length) {
        return false;
      }
      for (const key in { ...a, ...b }) {
        if (!compare(a[key], b[key])) {
          return false;
        }
      }
      seen.set(a, b);
      return true;
    }
    return false;
  })(c, d);
}
