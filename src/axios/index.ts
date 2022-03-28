import Axios from "./Axios";
import { AxiosInstance } from "./types";
import { CancelToken, isCancel } from "./cancel";
function createInstance(): AxiosInstance {
  let context = new Axios();
  let instance = Axios.prototype.request.bind(context);
  instance = Object.assign(instance, Axios.prototype, context);
  return instance as AxiosInstance;
}
var axios = createInstance();
axios.CancelToken = new CancelToken();
axios.isCancel = isCancel;
export default axios;
export * from "./types";
