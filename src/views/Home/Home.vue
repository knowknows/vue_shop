<template>
  <el-container class="Home-container">
    <!--头部区域-->
    <el-header>
      <div class="nav_box">
        <img src="../../assets/a.jpg" alt="" />
      </div>
      <div class="span">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button></el-header
    >
    <!--页面主体区域-->
    <el-container>
      <!--侧边栏-->
      <el-aside :width="isCollapse ? '63px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!--侧边栏菜单区域-->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!--这个是一级菜单-->
          <el-submenu
            :index="subitem.id + ''"
            v-for="subitem in menuList"
            :key="subitem.id"
          >
            <!--这个是一级菜单模板区域-->
            <template slot="title">
              <!--这个是一级菜单模板区域图标-->
              <i :class="homemenucions[subitem.id]"></i>
              <span>{{ subitem.authName }}</span>
            </template>

            <!--这个是二级菜单-->
            <el-menu-item
              v-for="item in subitem.children"
              :key="item.id"
              :index="'/' + item.path"
              @click="saveNavState('/' + item.path + '')"
            >
              <template slot="title">
                <!--这个是二级菜单模板区域图标-->
                <i class="el-icon-menu"></i>
                <span>{{ item.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧内容-->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import { get } from "../../assets/js/request";
import api from "../../assets/js/api.js";
export default {
  data() {
    return {
      //左侧菜单数据
      menuList: [],
      //循环图标
      homemenucions: {
        125: "iconfont icon-user",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao"
      },
      //isCollapse 是否折叠
      isCollapse: false,
      //被激活的链接地址
      activePath: ""
    };
  },
  created() {
    this.getMenuList();
    this.activePaths();
  },
  methods: {
    //1:登录
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    //2:获取所有得左侧菜单
    async getMenuList() {
      let res = await get(api.menus);
      if (res.meta.status !== 200) {
        return this.$message.eror(res.meta.msg);
      }
      this.menuList = res.data;
      // console.log(res.data);
    },
    //3:点击按钮且换菜单的折叠和展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    //4:保存链接的激活状态
    saveNavState(activePath) {
      //console.log(22222222222, this.$route.path.split("/").reverse()[0]);
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    },
    //5:当前呗激活的状态
    activePaths() {
      this.activePath = window.sessionStorage.getItem("activePath");
    }
  },
  computed: {
    // defaultActive() {
    //   return "/" + this.$route.path.split("/").reverse()[0];
    //   console.log(22222222222, this.$route.path.split("/").reverse()[0]);
    // }
  }
};
</script>
<style lang="less" scoped>
.Home-container {
  height: 100vh;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  .nav_box {
    width: 50px;
    height: 50px;
    border: 1px solid #eee;
    border-radius: 50%;

    box-shadow: 0 0 10px #ddd;

    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .span {
    position: fixed;
    left: 90px;
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
