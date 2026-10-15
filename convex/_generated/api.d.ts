/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ResendOTP from "../ResendOTP.js";
import type * as acesso from "../acesso.js";
import type * as auth from "../auth.js";
import type * as binyra from "../binyra.js";
import type * as chaves from "../chaves.js";
import type * as compras from "../compras.js";
import type * as http from "../http.js";
import type * as produtos from "../produtos.js";
import type * as remetente from "../remetente.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ResendOTP: typeof ResendOTP;
  acesso: typeof acesso;
  auth: typeof auth;
  binyra: typeof binyra;
  chaves: typeof chaves;
  compras: typeof compras;
  http: typeof http;
  produtos: typeof produtos;
  remetente: typeof remetente;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: { resend: import("@convex-dev/resend").ResendComponent };
