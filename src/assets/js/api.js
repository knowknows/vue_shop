const baseUrl = "http://127.0.0.1:8888/api/private/v1";
//缓存接口
const storage = window.localStorage;
//暴露接口
//脚手架的暴露操作 已经给我们做好了
//暴露完后就去页面进行引入,如这里注册页面要进行引入的话，就去Result.vue进行引入
module.exports = {
  login: baseUrl + '/login',//登录接口  http://pizzaback.bluej.cn/
  menus: baseUrl + '/menus',//1.4-2左侧菜单权限
  users: baseUrl + '/users',//1.3.1. 用户数据列表
  rights: baseUrl + '/rights',// 所有权限列表
  roles: baseUrl + '/roles',//1.5.1. 角色列表
  categories: baseUrl + '/categories',//1.6.1商品分类数据列表
  goods: baseUrl + '/goods',//1.8.1. 商品列表数据
  orders: baseUrl + '/orders',//订单列表
  kuaidi: baseUrl + '/kuaidi',
  reports: baseUrl + '/reports'
}   