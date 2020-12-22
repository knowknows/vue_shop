import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () => import('../views/login/Login.vue');
const Home = () => import('../views/Home/Home.vue');
const Welcome = () => import('../views/Home/childComps/Welcome.vue');
const Users = () => import('../views/Home/childComps/uesr/Users.vue');
const Userright = () => import('../views/power/Userrights.vue');
const Roles = () => import('../views/power/Roles.vue');
const GoodsList = () => import('../views/goods/GoodsList.vue');
const Cate = () => import('../views/goods/Cate.vue')
const Params = () => import('../views/goods/Params.vue')
const Add = () => import('../views/goods/add.vue')
const Order = () => import('../views/order/Order.vue')
const Report = () => import('../views/report/Report.vue')
Vue.use(VueRouter)
const routes = [
  {
    path: '',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome,
      },
      {
        path: '/users',
        component: Users,
      },
      {
        path: '/rights',
        component: Userright,
      },
      {
        path: '/roles',
        component: Roles,
      },
      {
        path: '/goods',
        component: GoodsList,
      },
      {
        path: '/categories',
        component: Cate,
      },
      {
        path: '/params',
        component: Params,
      },
      {
        path: '/goods/add',
        component: Add,
      },
      {
        path: '/orders',
        component: Order,
      },
      {
        path: '/reports',
        component: Report,
      }

    ]
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})
router.beforeEach((to, from, next) => {
  if (to.path == '/login') {
    return next();
  } else {
    const token = window.sessionStorage.getItem('token')
    if (!token) {
      return next('/login');
    }
    next();
  }

})
export default router
