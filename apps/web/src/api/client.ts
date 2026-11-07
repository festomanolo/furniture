import { env, isDemoMode } from "@/lib/env";
import { createDemoClient } from "./demo";
import { createHttpClient } from "./http";
import type { ApiClient } from "./types";

export const api: ApiClient = isDemoMode ? createDemoClient() : createHttpClient(env.apiUrl);
