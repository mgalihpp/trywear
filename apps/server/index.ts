import cors from "cors";
import express, { type Application } from "express";
import swaggerUi from "swagger-ui-express";
import appConfig from "@/configs/appConfig";
import { corsOptions } from "@/configs/cors";
import swaggerDocs from "@/configs/swagger";
import { errorHandler } from "@/middleware/errorHandler";
import {
  addRequestId,
  consoleLogger,
  errorLogger,
  requestLogger,
  securityLogger,
} from "@/middleware/logger";
import { generalLimiter } from "@/middleware/rateLimiter";
import { paymentScheduler } from "@/modules/payment/payment.scheduler";
import v1Router from "@/routes";

declare global {
  interface BigInt {
    toJSON(): number | string;
  }
}

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString(), 10);
  // Return numeric value if it's a safe integer, otherwise return string representation
  return Number.isSafeInteger(int) ? int : this.toString();
};

const app: Application = express();
const port: number = Number(appConfig.PORT);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware tambahan dapat ditambahkan di sini
app.use(addRequestId);
app.use(securityLogger);
app.use(requestLogger);
app.use(consoleLogger);
app.use(errorLogger);

// Biar Aplikasi Tidak Crash
app.use(errorHandler);

app.use(generalLimiter);

// Daftarkan router untuk API versi 1
app.use(`${appConfig.BASE_API_PATH}/v1`, v1Router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(port, () => {
  console.log(
    `Server running on port ${port}\n\nRunning: ${appConfig.SERVER_ORIGIN}\n\n`,
  );

  // Start background schedulers
  paymentScheduler.start();
});

export default app;
