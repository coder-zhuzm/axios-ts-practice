import AxiosInterceptorManager from "./AxiosInterceptorManager";
export type Methods =
  | "GET"
  | "get"
  | "POST"
  | "post"
  | "PUT"
  | "put"
  | "DELETE"
  | "delete";
export interface AxiosInstance {
  (config: AxiosRequestConfig): any;
  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };
  CancelToken: any;
  isCancel: any;
}

export interface AxiosRequestConfig extends Record<string, any> {
  url?: string;
  method?: Methods;
  params?: Record<string, any>;
  data?: Record<string, any>;
  headers?: Record<string, any>;
  timeout?: number;
  transformRequest?: (
    data: Record<string, any>,
    headers: Record<string, any>
  ) => any;
  transformResponse?: (data: any) => any;
}

export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: AxiosRequestConfig;
  request?: any;
}
