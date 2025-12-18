/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */

import MidTrans from "@repo/midtrans";
import appConfig from "@/configs/appConfig";

export const snap = new MidTrans.Snap({
  isProduction: appConfig.NODE_ENV !== "development",
  serverKey:
    appConfig.NODE_ENV !== "development"
      ? appConfig.MIDTRANS_SANDBOX_SERVER_KEY
      : appConfig.MIDTRANS_SANDBOX_SERVER_KEY,
  clientKey:
    appConfig.NODE_ENV !== "development"
      ? appConfig.MIDTRANS_SANDBOX_CLIENT_KEY
      : appConfig.MIDTRANS_SANDBOX_CLIENT_KEY,
});
