import http from './http'
import api from './api'
//封装get请求
export function get(url, params) {
  return new Promise((resolve, reject) => {
    http.get(url, {
      params
    })
      .then((res) => {
        // console.log(res);
        resolve(res)
      })
      .catch((err) => {
        console.log(err);
        reject(err)
      })
  })
}
//封装post请求
export function post(url, data) {
  return new Promise((resolve, reject) => {
    http.post(url, data)
      .then((res) => {
        // console.log(res);
        resolve(res)
      })
      .catch((err) => {
        // console.log(err);
        reject(err)
      })
  })
}
/*
*patch 请求方法
* @param url
* @param data
* @returns {Promise}
 */
export function patch(url, data) {
  return new Promise((resolve, reject) => {
    http.patch(url, data)
      .then((res) => {
        // console.log(res);
        resolve(res)
      })
      .catch((err) => {
        // console.log(err);
        reject(err)
      })
  })
}
/*
*put 请求方法
* @param url
* @param data
* @returns {Promise}
 */
export function put(url, data) {
  return new Promise((resolve, reject) => {
    http.put(url, data)
      .then((res) => {
        // console.log(res);
        resolve(res)
      })
      .catch((err) => {
        // console.log(err);
        reject(err)
      })
  })
}

/**
 * delete
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function deletefn(url, data) {
  return new Promise((resolve, reject) => {
    http.delete(url, data)
      .then(res => {
        resolve(res);
        // Loading.service(true).close();
        //  Message({message: '请求成功', type: 'success'});
      })
      .catch(err => {
        reject(erra)
        // Loading.service(true).close();
        Message({ message: '加载失败', type: 'error' });
      })
  });
}