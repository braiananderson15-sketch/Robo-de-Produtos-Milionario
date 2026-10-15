import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTP } from "./ResendOTP";
const TRINTA_DIAS = 30 * 24 * 60 * 60 * 1000;
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [ResendOTP],
  session: { totalDurationMs: TRINTA_DIAS, inactiveDurationMs: TRINTA_DIAS },
});
