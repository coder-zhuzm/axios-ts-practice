import axios, { AxiosRequestConfig, AxiosResponse } from "./axios";
const baseURL = 'http://localhost:8080'

interface User {
  name: string,
  password: string
}
let user: User = {
  name: 'zhufeng',
  password: '123456'
}
// 基本get请求
axios({
  method: 'get',
  url: baseURL + '/get',
  params: user
}).then((response: AxiosResponse) => {
  console.log('基本get请求', response);
  return response.data;
}).then((data: User) => {
  console.log('基本get请求', data);
}).catch(function (error: any) {
  console.log(error);
});



//   post请求
axios({
  method: 'post',
  url: baseURL + '/post',
  headers: { 'Content-Type': 'application/json' },
  data: user
}).then((response: AxiosResponse) => {
  console.log('post请求', response);
  return response.data;
}).then((data: User) => {
  console.log('post请求', data);
}).catch(function (error: any) {
  console.log(error);
});

// 网络错误
setTimeout(() => {
  axios({
    method: 'post',
    url: baseURL + '/post',
    headers: { 'Content-Type': 'application/json' },
    data: user
  }).then((response: AxiosResponse) => {
    console.log('网络错误', response);
    return response.data;
  }).then((data: User) => {
    console.log('网络错误', data);
  }).catch(function (error: any) {
    console.log(error);
  });
}, 5000)

// 超时
axios({
  method: 'post',
  url: baseURL + '/post_timeout?timeout=3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 1000,
  data: user
}).then((response: AxiosResponse) => {
  console.log('超时', response);
  return response.data;
}).then((data: User) => {
  console.log('超时', data);
}).catch(function (error: any) {
  console.log('超时', error);
});

// 错误状态码
axios({
  method: 'post',
  url: baseURL + '/post_status?code=300',
  headers: { 'Content-Type': 'application/json' },
  data: user
}).then((response: AxiosResponse) => {
  console.log('错误状态码', response);
  return response.data;
}).then((data: User) => {
  console.log('错误状态码', data);
}).catch(function (error: any) {
  console.log('错误状态码', error);
});

//  拦截器

console.time('cost');
axios.interceptors.request.use((config: AxiosRequestConfig) => {
  console.timeEnd('cost');
  config.headers!.name += '1';
  return config;
  //return Promise.reject('在1处失败了!');
})
let request_interceptor = axios.interceptors.request.use((config: AxiosRequestConfig) => {
  config.headers!.name += '2';
  return config;
})

axios.interceptors.request.use((config: AxiosRequestConfig) => {
  return new Promise<AxiosRequestConfig>(function (resolve) {
    setTimeout(function () {
      config.headers!.name += '3';
      resolve(config);
    }, 3000);
  });
})
axios.interceptors.request.eject(request_interceptor);
axios.interceptors.response.use((response: AxiosResponse) => {
  response.data.username += '1'
  return response;
})
axios.interceptors.request.use((config: AxiosRequestConfig) => {
  config.headers!.name += '4';
  return config;
})
let response_interceptor = axios.interceptors.response.use((response: AxiosResponse) => {
  response.data.username += '2'
  return response;
})
axios.interceptors.response.use((response: AxiosResponse) => {
  response.data.username += '3';
  return response;
  //return Promise.reject('失败了');
})
axios.interceptors.response.eject(response_interceptor);
axios({
  method: 'post',
  url: baseURL + '/post',
  headers: { 'Content-Type': 'application/json', name: 'name' },
  data: user,
}).then((response: AxiosRequestConfig | AxiosResponse<User>) => {
  console.log('拦截器', response);
  console.timeEnd('cost');
  return response.data as User;
}).then((data: User) => {
  console.log('拦截器', data);
}).catch(function (error: any) {
  console.log('error', error);
});



// 取消功能

const CancelToken = axios.CancelToken;
const source = CancelToken.source();
axios({
  method: 'post',
  url: baseURL + '/post',
  timeout: 3000,
  data: user,
  headers: { 'Content-Type': 'application/json', name: 'name' },
  cancelToken: source.token
}).then((response: AxiosRequestConfig | AxiosResponse<User>) => {
  console.log(response);
  return response.data as User;
}).then((data: User) => {
  console.log(data);
}).catch(function (error: any) {
  if (axios.isCancel(error)) {
    console.log('请求取消', error);
  } else {
    console.log('error', error);
  }
});
source.cancel('用户取消请求');