<template>
  <div>
    <!---面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInf.query" clearable @clear="getUserList" @input="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!--用户列表区域-->
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- {{ scope.row }} -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"> </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操做" width="190px">
          <template slot-scope="scope">
            <!-- {{ scope.row }} -->
            <!--修改按钮--->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!--删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteEditDialog(scope.row.id)"></el-button>
            <!--分配角色按钮-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="userupClick(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域--->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInf.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInf.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!--添加用户的时候对话框
    visible.sync:显示还是关闭
    -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="30%" @close="closeaddDialog">
      <!--主体内容区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>

        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDialogs">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改用户信息-->
    <el-dialog title="修改用户信息" :visible.sync="updateDialogVisible" width="30%" @close="updateDialogClosed">
      <!--主体内容区域-->
      <el-form :model="showusers" :rules="addFormRules" ref="updateFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="showusers.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="showusers.email"></el-input>
        </el-form-item>

        <el-form-item label="手机" prop="mobile">
          <el-input v-model="showusers.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUserInfo(showusers.id)">确 定</el-button>
      </span>
    </el-dialog>

    <!--分配角色弹窗-->
    <el-dialog title="分配角色" :visible.sync="diauserVisible" width="50%" @close="updateusernameClose">
      <div>
        <p>当前的用户:{{ updateuser.username }}</p>
        <p>当前的角色:{{ updateuser.role_name }}</p>
        <p>
          分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in roleNameList" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="diauserVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo(updateuser.id)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { get, put, post, deletefn } from '../../../../assets/js/request';
import api from '../../../../assets/js/api';
export default {
  data() {
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      if (!regEmail.test(value)) {
        return callback(new Error('请输入正确的邮箱'));
      } else {
        callback();
      }
    };
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$$/;
      if (!regMobile.test(value)) {
        return callback(new Error('请输入正确的手机号码'));
      } else {
        callback();
      }
    };
    return {
      queryInf: {
        //用户
        query: '',
        //当前页数
        pagenum: 1,
        //当前每页显示多少条
        pagesize: 2
      },
      diauserVisible: false,
      userList: [],
      total: 0,
      addDialogVisible: false,
      updateDialogVisible: false,
      //addForm
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      showusers: {},
      //装用户名和角色
      updateuser: {},
      //把所有的的权限选出来
      roleNameList: [],
      //用户id
      userId: '',
      //选中角色的·id
      selectedRoleId: ''
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    //用户列表数据的获取
    async getUserList() {
      let res = await get(api.users, this.queryInf);
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败');
      } else {
        this.userList = res.data.users;
        this.total = res.data.total;
      }
    },
    //监听pagesize 改变的事件
    handleSizeChange(newsize) {
      // console.log(111, newsize);
      this.queryInf.pagesize = newsize;
      this.getUserList();
    },
    //监听页码值改变的事件
    handleCurrentChange(newpage) {
      this.queryInf.pagenum = newpage;
      // console.log(2222, newpage);
      this.getUserList();
    },
    //监听状态发生改变
    async userStateChange(userinfo) {
      let res = await put(api.users + `/${userinfo.id}/state/${userinfo.mg_state}`);
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error('更改失败了');
      } else {
        return this.$message.success('操做成功');
      }
      // console.log(res);
    },
    //关闭对话框的时候清除数据
    closeaddDialog() {
      this.$refs.addFormRef.resetFields();
    },
    //添加对话框的数据
    addDialogs() {
      this.$refs.addFormRef.validate(async ispass => {
        // console.log(ispass);
        if (ispass) {
          let res = await post(api.users, this.addForm);
          // console.log(res);
          if (res.meta.status === 201) {
            this.addDialogVisible = false;
            this.getUserList();
          } else {
            return this.$message.error('添加失败');
          }
          // console.log(1111, res);
        } else {
          return this.$message.error('请完善信息');
        }
      });
    },
    //修改对话框的数据
    async showEditDialog(id) {
      let res = await get(api.users + `/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error('获取信息失败');
      }
      this.showusers = res.data;
      this.updateDialogVisible = true;
    },
    //监听修改用户对话框的事件
    updateDialogClosed() {
      this.$refs.updateFormRef.resetFields();
    },
    //修改用户信息并提交
    updateUserInfo(id) {
      this.$refs.updateFormRef.validate(async ispass => {
        if (!ispass) {
          return this.$message.error('请完善信息!');
        }
        let data = {
          email: this.showusers.email,
          mobile: this.showusers.mobile
        };
        let res = await put(api.users + `/${id}`, data);
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败!');
        }
        this.updateDialogVisible = false;
        this.getUserList();
        this.$message.success('更新用户信息成功!');
        // console.log(222, res);
      });
    },
    //删除用户信息
    async deleteEditDialog(id) {
      let confir = await this.$confirm('此操作将永久删除用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      //confirm 确认的时候
      //cancel 取消的时候
      // console.log('confir', confir);
      if (confir !== 'confirm') {
        return this.$message.error('已经取消删除！');
      }

      let res = await deletefn(api.users + `/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户信息失败!');
      }
      this.$message.success('删除用户信息成功!');
      this.getUserList();
    },
    //分配角色弹窗的数据渲染
    async userupClick(users) {
      this.userId = users.id;
      let res = await get(api.roles);
      if (res.meta.status != 200) {
        return this.$message.error('获取数据失败!');
      }
      this.roleNameList = res.data;
      // console.log('users', users);
      this.updateuser = users;
      this.diauserVisible = true;
    },
    //点击按钮分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择角色!');
      }
      let data = {
        rid: this.selectedRoleId
      };
      let res = await put(api.users + `/${this.userId}/role`, data);
      if (res.meta.status != 200) {
        return this.$message.error('更新角色失败!');
      }
      this.$message.success('更新角色成功!');
      this.getUserList();
      this.diauserVisible = false;
    },
    //分配角色后关闭清除数据
    updateusernameClose() {
      this.updateuser = {}
      this.selectedRoleId = '';
    }
  }
};
</script>
<style lang="less" scoped>
.userrow {
  margin-bottom: 20px;
}
p {
  margin-bottom: 10px;
}
</style>
