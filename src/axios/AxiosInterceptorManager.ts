export interface OnFulfilledFn<V> {
  (value: V): V | Promise<V>;
}

export interface OnRejectedFn {
  (error: any): any;
}
export interface Interceptor<T = any> {
  onFulfilled: OnFulfilledFn<T>;
  onRejected?: OnRejectedFn;
}

export default class InterceptorManager<V> {
  interceptors: Array<Interceptor<V> | null> = [];
  use(onFulfilled: OnFulfilledFn<V>, onRejected?: OnRejectedFn): number {
    this.interceptors.push({
      onFulfilled,
      onRejected,
    });
    return this.interceptors.length - 1;
  }
  eject(id: number): void {
    if (this.interceptors[id]) {
      this.interceptors[id] = null;
    }
  }
}
