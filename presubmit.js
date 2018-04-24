#!/usr/bin/env node
const { spawnSync } = require("child_process");

function run(cmd, env = {}) {
  let args = cmd.split(/\s+/);
  console.log(args.join(" "));
  let exe = args.shift();
  let r = spawnSync(exe, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env }
  });
  if (r.error) throw r.error;
  if (r.status) {
    console.log("Error", args[0]);
    process.exit(r.status);
  }
}

run("yarn");
run("yarn build");
run("yarn lint");

require("ts-node").register({project: __dirname + "/tsconfig.json" });
require("./util_test");
require("./jasmine_shim_test");
