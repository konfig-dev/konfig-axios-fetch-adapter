import {
  AxiosAdapter,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import settle from "./settle";
import buildURL from "./helpers/buildURL";
import buildFullPath from "./core/buildFullPath";
const SafeReadableStream =
  typeof ReadableStream !== "undefined"
    ? ReadableStream
    : require("web-streams-polyfill").ReadableStream;
const SafeHeaders =
  typeof Headers !== "undefined" ? Headers : require("node-fetch").Headers;
const SafeRequest =
  typeof Request !== "undefined" ? Request : require("node-fetch").Request;
const safeFetch = typeof fetch !== "undefined" ? fetch : require("node-fetch");
import { isUndefined, isStandardBrowserEnv, isFormData } from "./utils";

/**
 * - Create a request object
 * - Get response body
 * - Check if timeout
 */
const fetchAdapter: AxiosAdapter = async (config) => {
  const request = createRequest(config);
  const promiseChain = [getResponse(request, config)];

  if (config.timeout && config.timeout > 0) {
    promiseChain.push(
      new Promise((res) => {
        setTimeout(() => {
          const message = config.timeoutErrorMessage
            ? config.timeoutErrorMessage
            : "timeout of " + config.timeout + "ms exceeded";
          res(createError(message, config, "ECONNABORTED", request));
        }, config.timeout);
      })
    );
  }

  const data = await Promise.race(promiseChain);
  return new Promise((resolve, reject) => {
    if (data instanceof Error) {
      reject(data);
    } else {
      settle(resolve, reject, data);
    }
  });
};

/**
 * Fetch API stage two is to get response body. This funtion tries to retrieve
 * response body based on response's type
 */
async function getResponse(
  request: Request,
  config: AxiosRequestConfig
): Promise<AxiosResponse | Error> {
  let stageOne: Response;
  try {
    stageOne = await safeFetch(request);
  } catch (e) {
    if (e instanceof Error)
      return createError(e.message, config, "ERR_NETWORK", request);
    return createError("Network Error", config, "ERR_NETWORK", request);
  }

  let data: any;
  if (stageOne.status >= 200 && stageOne.status !== 204) {
    switch (config.responseType) {
      case "arraybuffer":
        data = await stageOne.arrayBuffer();
        break;
      case "blob":
        data = await stageOne.blob();
        break;
      case "json":
        data = await stageOne.json();
        break;
      case "stream":
        // Check if the stream is a NodeJS stream or a browser stream.
        // @ts-ignore - TS doesn't know about `pipe` on streams.
        const isNodeJsStream = typeof stageOne.body.pipe === "function";
        data = isNodeJsStream
          ? nodeToWebReadableStream(stageOne.body)
          : stageOne.body;
        break;
      default:
        data = await stageOne.text();
        break;
    }
  }

  function nodeToWebReadableStream(nodeReadable) {
    return new SafeReadableStream({
      start(controller) {
        nodeReadable.on("data", (chunk) => {
          controller.enqueue(chunk);
        });

        nodeReadable.on("end", () => {
          controller.close();
        });

        nodeReadable.on("error", (err) => {
          controller.error(err);
        });
      },
    });
  }

  const response: AxiosResponse<any> = {
    data,
    status: stageOne.status,
    statusText: stageOne.statusText,
    headers: Object.fromEntries(Object.entries(stageOne.headers)), // Make a copy of headers
    config: config,
    request,
  };

  return response;
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * This function will create a Request object based on configuration's axios
 */
function createRequest(config: AxiosRequestConfig): Request {
  const headers = config.headers
    ? new SafeHeaders(
        Object.keys(config.headers).reduce((obj, key) => {
          if (config.headers === undefined) throw Error();
          obj[key] = String(config.headers[key]);
          return obj;
        }, {})
      )
    : new SafeHeaders({});

  // HTTP basic authentication
  if (config.auth) {
    const username = config.auth.username || "";
    const password = config.auth.password
      ? decodeURI(encodeURIComponent(config.auth.password))
      : "";
    headers.set(
      "Authorization",
      `Basic ${Buffer.from(username + ":" + password).toString("base64")}`
    );
  }

  const method = config.method?.toUpperCase();
  const options: Partial<Writeable<Request>> = {
    headers: headers,
    method,
  };
  if (method !== "GET" && method !== "HEAD") {
    options.body = config.data;

    // In these cases the browser will automatically set the correct Content-Type,
    // but only if that header hasn't been set yet. So that's why we're deleting it.
    if (isFormData(options.body) && isStandardBrowserEnv()) {
      headers.delete("Content-Type");
    }
  }
  // This config is similar to XHR’s withCredentials flag, but with three available values instead of two.
  // So if withCredentials is not set, default value 'same-origin' will be used
  if (!isUndefined(config.withCredentials)) {
    options.credentials = config.withCredentials ? "include" : "omit";
  }

  const fullPath = buildFullPath(config.baseURL, config.url);
  const url = buildURL(fullPath, config.params, config.paramsSerializer);

  // Expected browser to throw error if there is any wrong configuration value
  return new SafeRequest(url, options);
}

/**
 * Note:
 *
 *   From version >= 0.27.0, createError function is replaced by AxiosError class.
 *   So I copy the old createError function here for backward compatible.
 *
 *
 *
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
function createError(
  message: string,
  config: AxiosRequestConfig,
  code: string,
  request: Request,
  response?: AxiosResponse
): Error {
  if (AxiosError && typeof AxiosError === "function") {
    return new AxiosError(message, AxiosError[code], config, request);
  }

  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
}

/**
 *
 * Note:
 *
 *   This function is for backward compatible.
 *
 *
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status:
        this.response && this.response.status ? this.response.status : null,
    };
  };
  return error;
}

export default fetchAdapter;
