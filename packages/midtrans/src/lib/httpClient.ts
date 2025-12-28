import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";
import MidtransError from "./midtransError";

type err = {
  message: string;
};

export type ParentObj = Record<string, unknown>;

/**
 * Wrapper of Axios to do API request to Midtrans API
 * @return {Promise<any>} of API response, or exception during request
 * capable to do HTTP `request`
 */
class HttpClient {
  parent: ParentObj;
  http_client: AxiosInstance;

  constructor(parentObj: ParentObj = {}) {
    this.parent = parentObj;
    this.http_client = axios.create();
  }

  request<T>(
    httpMethod: string,
    serverKey: string,
    requestUrl: string,
    firstParam: Record<string, unknown> = {},
    secondParam: Record<string, unknown> = {},
  ): Promise<T> {
    const headers = {
      "content-type": "application/json",
      accept: "application/json",
      "user-agent": "midtransclient-nodejs/1.3.0",
    };

    let reqBodyPayload: Record<string, unknown> = {};
    let reqQueryParam: Record<string, unknown> = {};
    if (httpMethod.toLowerCase() === "get") {
      reqQueryParam = firstParam;
      reqBodyPayload = secondParam;
    } else {
      reqBodyPayload = firstParam;
      reqQueryParam = secondParam;
    }

    return new Promise((resolve, reject) => {
      if (typeof reqBodyPayload === "string") {
        try {
          reqBodyPayload = JSON.parse(reqBodyPayload) as Record<
            string,
            unknown
          >;
        } catch (err) {
          reject(
            new MidtransError(
              `Failed to parse 'body parameters' string as JSON. Use JSON string or Object as 'body parameters'. Error: ${(err as err).message}`,
            ),
          );
          return;
        }
      }
      if (typeof reqQueryParam === "string") {
        try {
          reqQueryParam = JSON.parse(reqQueryParam) as Record<string, unknown>;
        } catch (err) {
          reject(
            new MidtransError(
              `Failed to parse 'query parameters' string as JSON. Use JSON string or Object as 'query parameters'. Error: ${(err as err).message}`,
            ),
          );
          return;
        }
      }

      this.http_client({
        method: httpMethod,
        headers: headers,
        url: requestUrl,
        data: reqBodyPayload,
        params: reqQueryParam,
        auth: {
          username: serverKey,
          password: "",
        },
      })
        .then((res: AxiosResponse<{ status_code: number }>) => {
          const statusCode = Number(res.data.status_code);
          if (
            Object.hasOwn(res.data, "status_code") &&
            statusCode >= 400 &&
            statusCode !== 407
          ) {
            reject(
              new MidtransError(
                `Midtrans API returned an error. HTTP status code: ${res.data.status_code}. API response: ${JSON.stringify(res.data)}`,
                res.data.status_code,
                res.data,
                res,
              ),
            );
            return;
          }
          resolve(res.data as T);
        })
        .catch((err: AxiosError) => {
          const res = err.response;
          if (res && res.status >= 400) {
            reject(
              new MidtransError(
                `Midtrans API returned an error. HTTP status code: ${res.status}. API response: ${JSON.stringify(res.data)}`,
                res.status,
                res.data,
                res,
              ),
            );
          } else if (!res) {
            reject(
              new MidtransError(
                `Midtrans API request failed. HTTP response not found, likely connection failure. Error: ${err.message}`,
                null,
                null,
                err,
              ),
            );
          } else {
            reject(err);
          }
        });
    });
  }
}

export default HttpClient;
