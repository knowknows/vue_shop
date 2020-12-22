//1；引入资源库(前提是要安装了axios)
import axios from 'axios'

//Progress使用
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css' // Progress 进度条样式

//引入后使用
//1.新建一个axios的实例
let http = axios.create();

//2.去配置请求拦截器和响应拦截器
http.interceptors.request.use(function (config) {
  //如果说你不需要去操作直接忽略即可
  config.headers.Authorization = window.sessionStorage.getItem('token');

  //展示一个进度条 是自己下载的插件
  NProgress.start() //显示进度条
  NProgress.set(0.4)//
  //return config就是将新设置的类容覆盖默认的
  return config;
});

// 请求拦截器
// http.interceptors.request.use(function (config) {
//   //如果说你不需要去操作直接忽略即可
//   let token = window.sessionStorage.getItem;
//   if (token) {
//     //添加请求头
//     //所有操作都是跟config参数有关
//     config.headers['x-token'] = token;
//   }
//   //return config就是将新设置的类容覆盖默认的
//   return config;
// });

//响应拦截器
http.interceptors.response.use(function (response) {
  const res = response.data;

  NProgress.inc() //稍微增加
  NProgress.done() //完成进度(进度条消失)
  return res
})

//当拦截器配置好了之后我们就给他暴露出去给拦截器使用
export default http;