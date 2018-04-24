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

// tslint:disable-next-line:no-reference
/// <reference path='./jasmine_types.d.ts' />

import { equal, global } from "./util";
import { test } from "./index";

// tslint:disable-next-line:no-any
function inspect(...args: any[]) {
  console.log(...args);
}

export function generateMethods() {
  for (const name of Object.keys(matchTesters)) {
    // tslint:disable-next-line:no-any
    const pos = PositiveMatchers.prototype as any;
    // tslint:disable-next-line:no-any
    const neg = NegativeMatchers.prototype as any;
    const testFn = matchTesters[name];

    // tslint:disable-next-line:no-any
    pos[name] = function (...args: any[]) {
      if (!testFn(this.actual, ...args)) {
        const msg =
          `Expected ${inspect(this.actual)} ` +
          [name, ...args.map(a => inspect(a))].join(" ");
        throw new Error(msg);
      }
    };

    // tslint:disable-next-line:no-any
    neg[name] = function (...args: any[]) {
      if (testFn(this.actual, ...args)) {
        const msg =
          `Didn't expect ${inspect(this.actual)} ` +
          [name, ...args.map(a => inspect(a))].join(" ");
        throw new Error(msg);
      }
    };
  }
}

export type MatchTesters = {
  // tslint:disable-next-line:no-any
  [name: string]: (value: any, ...args: any[]) => boolean;
};

export class PositiveMatchers /* implements Matchers */ {
  // tslint:disable-next-line:no-any
  constructor(readonly actual: any) {}
  get not(): Matchers {
    const m = new NegativeMatchers(this.actual);
    // tslint:disable-next-line:no-any
    return (m as any) as Matchers;
  }
}

class NegativeMatchers /* implements Matchers */ {
  // tslint:disable-next-line:no-any
  constructor(readonly actual: any) {}
}

export const matchTesters: MatchTesters = {
  // tslint:disable-next-line:no-any
  toBe(value: any, expected: any): boolean {
    return value === expected;
  },

  // tslint:disable-next-line:no-any
  toBeNull(value: any): boolean {
    return value === null;
  },

  // tslint:disable-next-line:no-any
  toBeUndefined(value: any): boolean {
    return value === undefined;
  },

  // tslint:disable-next-line:no-any
  toEqual(value: any, expected: any): boolean {
    return equal(value, expected);
  },

  toBeLessThan(value: number, comparand: number): boolean {
    return value < comparand;
  },

  toBeLessThanOrEqual(value: number, comparand: number): boolean {
    return value <= comparand;
  },

  toBeGreaterThan(value: number, comparand: number): boolean {
    return value > comparand;
  },

  toBeGreaterThanOrEqual(value: number, comparand: number): boolean {
    return value >= comparand;
  },

  toThrow(fn: () => void): boolean {
    try {
      fn();
      return false;
    } catch (e) {
      return true;
    }
  },

  toThrowError(fn: () => void, message: string | RegExp): boolean {
    let error;
    try {
      fn();
    } catch (e) {
      error = e;
    }
    return (
      error instanceof Error &&
      (message === undefined || error.message.match(message) !== null)
    );
  }
};

class Suite {
  constructor(readonly name: string) {}
  before: HookFn[] = [];
  after: HookFn[] = [];
}

let currentSuite: Suite = null;

interface SpyInfo {
  // tslint:disable-next-line:no-any
  object: any;
  methodName: string;
  method: Function;
}

let spies: SpyInfo[] = [];

generateMethods();

// tslint:disable-next-line:no-any
global.expect = function expect(actual: any): Matchers {
  const m = new PositiveMatchers(actual);
  // tslint:disable-next-line:no-any
  return (m as any) as Matchers;
};

// tslint:disable-next-line:no-any
global.fail = (e?: any): void => {
  if (!(e instanceof Error)) {
    e = new Error(e);
  }
  throw e;
};

global.describe = function describe(name: string, fn: () => void): void {
  currentSuite = new Suite(name);
  fn();
  currentSuite = null;
};

global.it = function it(name: string, fn: (done?: DoneFn) => void): void {
  const suite = currentSuite;
  const isAsync = fn.length > 0;
  name = `${suite.name}: ${name}`;

  const wrapper = async() => {
    callHooks(suite.before);
    try {
      if (isAsync) {
        let done;
        const promise = new Promise((res, rej) => {
          done = res;
        });
        fn(done);
        await promise;
      } else {
        fn();
      }
    } finally {
      callHooks(suite.after);
      removeSpies();
    }
  };

  test({ fn: wrapper, name });
};

global.beforeEach = function beforeEach(fn: HookFn) {
  currentSuite.before.push(fn);
};

global.afterEach = function afterEach(fn: HookFn) {
  currentSuite.after.unshift(fn);
};

global.spyOn = function spyOn(object: {}, methodName: string): Spy {
  return {
    and: {
      returnValue(retVal) {
        // tslint:disable-next-line:no-any
        const o = object as any;
        spies.push({ object: o, methodName, method: o[methodName] });
        o[methodName] = () => retVal;
      }
    }
  };
};

function callHooks(hooks: HookFn[]) {
  for (const fn of hooks) {
    fn();
  }
}

function removeSpies() {
  for (const { object, methodName, method } of spies) {
    object[methodName] = method;
  }
  spies = [];
}
