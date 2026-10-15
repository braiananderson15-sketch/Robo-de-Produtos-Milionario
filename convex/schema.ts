import {defineSchema,defineTable} from "convex/server";
import {authTables} from "@convex-dev/auth/server";
import {v} from "convex/values";
const status=v.union(v.literal("ativa"),v.literal("cancelada"),v.literal("expirada"));
export default defineSchema({
 ...authTables,
 compras:defineTable({email:v.string(),produtoId:v.string(),status,orderId:v.string(),criadoEm:v.number(),atualizadaEm:v.number(),accessEndsAt:v.optional(v.number()),evento:v.optional(v.string()),boasVindasId:v.optional(v.string())})
  .index("por_email",["email"]).index("por_orderId",["orderId"]).index("por_email_produtoId_status",["email","produtoId","status"]),
 comprasTeste:defineTable({email:v.string(),produtoId:v.string(),status,orderId:v.string(),criadoEm:v.number(),atualizadaEm:v.number(),accessEndsAt:v.optional(v.number()),evento:v.string(),teste:v.literal(true)})
  .index("por_email",["email"]).index("por_orderId",["orderId"]),
});
