import { AxiosRequestConfig, AxiosResponse } from "./types";
import AxiosInterceptorManager, {
  Interceptor,
} from "./AxiosInterceptorManager";
import qs from "qs";
import parse from "parse-headers";

interface Interceptors {
  request: AxiosInterceptorManager<AxiosRequestConfig>;
  response: AxiosInterceptorManager<AxiosResponse>;
}
let defaults: AxiosRequestConfig = {
  method: "get",
  timeout: 0,
  headers: {
    common: {
      accept: "application/json",
    },
  },
  // 转换请求及响应
  transformRequest: function (
    data: Record<string, any>,
    headers: Record<string, any>
  ) {
    headers["content-type"] = "application/x-www-form-urlencoded";
    return qs.stringify(data);
  },
  transformResponse(data: any) {
    if (typeof data == "string") data = JSON.parse(data);
    return data;
  },
};
let getStyleMethods = ["get", "head", "delete", "options"];
getStyleMethods.forEach((method: string) => {
  defaults.headers![method] = {};
});

let postStyleMethods = ["put", "post", "patch"];
postStyleMethods.forEach((method: string) => {
  defaults.headers![method] = {};
});
let allMethods = [...getStyleMethods, ...postStyleMethods];

class Axios {
  public defaults: AxiosRequestConfig = defaults;
  public interceptors: Interceptors = {
    request: new AxiosInterceptorManager<AxiosRequestConfig>(),
    response: new AxiosInterceptorManager<AxiosResponse>(),
  };
  request<T>(
    config: AxiosRequestConfig
  ): Promise<AxiosRequestConfig | AxiosResponse<T>> {
    if (config.transformRequest && config.data)
      config.data = config.transformRequest(config.data, (config.headers = {}));
    // 合并配置
    config.headers = Object.assign(this.defaults.headers, config.headers);
    // 默认值,调用 dispatchRequest
    const chain: Interceptor[] = [
      {
        onFulfilled: this.dispatchRequest,
        onRejected: undefined,
      },
    ];
    this.interceptors.request.interceptors.forEach(
      (interceptor: Interceptor<AxiosRequestConfig> | null) => {
        interceptor && chain.unshift(interceptor);
      }
    );

    this.interceptors.response.interceptors.forEach(
      (interceptor: Interceptor<AxiosResponse<T>> | null) => {
        interceptor && chain.push(interceptor);
      }
    );
    let promise: Promise<AxiosRequestConfig | AxiosResponse<T>> =
      Promise.resolve(config);
    // 遍历chains 执行其中的函数
    while (chain.length) {
      const { onFulfilled, onRejected } = chain.shift()!;
      promise = promise.then(onFulfilled, onRejected);
    }
    return promise;
  }
  dispatchRequest<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return new Promise((resolve, reject) => {
      let { method = "get", url, params, data, headers, timeout } = config;
      let request: XMLHttpRequest = new XMLHttpRequest();
      if (params) {
        let paramsString = qs.stringify(params);
        url = url + (url!.indexOf("?") === -1 ? "?" : "&") + paramsString;
      }
      request.open(method, url!, true);
      request.responseType = "json";
      request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status !== 0) {
          if (request.status >= 200 && request.status < 300) {
            let response: AxiosResponse = {
              data: request.response,
              status: request.status,
              statusText: request.statusText,
              headers: parse(request.getAllResponseHeaders()),
              config: config,
              request,
            };
            if (config.transformResponse) {
              response.data = config.transformResponse(response.data);
            }
            resolve(response);
          } else {
            // 抛出错误http状态码
            reject(
              new Error(`Request failed with status code ${request.status}`)
            );
          }
        }
      };
      // header头的添加
      if (headers) {
        for (let key in headers) {
          if (key === "common" || allMethods.includes(key)) {
            for (let key2 in headers[key]) {
              request.setRequestHeader(key2, headers[key][key2]);
            }
          } else {
            request.setRequestHeader(key, headers[key]);
          }
        }
      }
      let body: string | null = null;
      // post 请求参数
      if (data && typeof data === "object") {
        body = JSON.stringify(data);
      }
      //  cancel 取消请求
      if (config.cancelToken) {
        config.cancelToken.then((reason: string) => {
          request.abort();
          reject(reason);
        });
      }
      request.onerror = () => {
        //网络异常
        reject(new Error("Network Error"));
      };
      // 网络超时
      if (timeout) {
        request.timeout = timeout;
        request.ontimeout = () => {
          //超时异常
          reject(new Error(`timeout of ${timeout}ms exceeded`));
        };
      }
      request.send(body);
    });
  }
}
export default Axios;
