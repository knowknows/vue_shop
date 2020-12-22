import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import 'default-passive-events'
//导入全局样式
import "./assets/css/base.css"
//导入css
import "./assets/fonts/iconfont.css"
//引入htpp
import http from './assets/js/http'
//安装这个树状插件
import TreeTable from 'vue-table-with-tree-grid'

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入符文版编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme


//把这个tree-table插件安装到项目中
Vue.component('tree-table', TreeTable)
// import preventClick from './common/clickState'
// Vue.use(preventClick)
//把这个富文本编辑器注入到组件
Vue.use(VueQuillEditor, /* { default global options } */)

Vue.config.productionTip = false
//每个页面需要使用这里htpp
Vue.prototype.$http = http;
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
