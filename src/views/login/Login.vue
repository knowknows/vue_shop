<template>
  <div class="login_contatiner">
    <div class="login_box">
      <!--头像区-->
      <div class="nav_box">
        <img src="../../assets/a.jpg" alt="" />
      </div>
      <!--登录表单区域-->
      <el-form
        label-width="0"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
      >
        <!--用户名-->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!--密码-->
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            suffix-icon="iconfont icon-showpassword"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <!--按钮区域-->
        <el-form-item class="btns">
          <el-button type="primary" @click="login" v-preventReClick
            >登录</el-button
          >
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { post } from "../../assets/js/request";
import api from "../../assets/js/api.js";

import preventReClick from "../../common/clickState"; //防多次点击，重复提交
export default {
  data() {
    return {
      //表单数据绑定
      loginForm: {
        username: "admin",
        password: "123456"
      },
      res: {},
      loginFormRules: {
        username: [
          { required: true, message: "请输入登录名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ],
        password: [{ required: true, message: "请输入密码", trigger: "change" }]
      }
    };
  },
  methods: {
    //点击重置按钮,重置登录表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    //登录事件
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return;
        let res = await post(api.login, this.loginForm);
        if (res.meta.status !== 200) {
          return this.$message.error("登录失败");
        } else {
          this.$message.success("登录成功了");
          window.sessionStorage.setItem("token", res.data.token);
          this.$router.push("/home");
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.login_contatiner {
  background-color: #2b4b6b;
  height: 100vh;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .nav_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
}
</style>
