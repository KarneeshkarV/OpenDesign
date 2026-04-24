import { registry } from "./registry";

const rivetEndpoint = process.env.RIVET_ENDPOINT ?? "http://localhost:6420";

console.log(`[sandbox-agent] connecting to rivet engine at ${rivetEndpoint}`);
// rivetkit reads RIVET_ENDPOINT / RIVET_TOKEN from the environment.
// The Docker-hosted engine exposes :6420 by default.
registry.start();
console.log("[sandbox-agent] registry started");
