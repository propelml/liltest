# liltest

A very very simple test runner for JavaScript and TypeScript that supports
running in browser and in Node.

https://github.com/propelml/liltest

## TypeScript Example

Create a file called mytest.ts

```typescript
import { assert, assertEqual, test } from "liltest";

test(async function failingTest() {
  assertEqual([0, 1, 100], [0, 1, 2]);
});

test(async function workingTest() {
  assertEqual([0, 1, 2], [0, 1, 2]);
});
```

Run the test from Node by doing `ts-node mytest.ts`
