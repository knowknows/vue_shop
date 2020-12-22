<template>
  <div>
    <!---面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/rights' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="roleVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!--权限的数据渲染-->
      <el-table :data="rolesList" style="width: 100%" border stripe>
        <!--这里时展开项-->
        <el-table-column type="expand" align="center">
          <template slot-scope="scope">
            <el-row v-for="(item1, index1) in scope.row.children" :key="item1.id" :class="[index1 === 0 ? 'topborder' : '', 'bottomborder', 'vcenter']">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级和三级权限-->
              <el-col :span="19">
                <el-row v-for="(itme2, index2) in item1.children" :key="itme2.id" :class="[index2 === 0 ? '' : 'topborder', 'vcenter']">
                  <el-col :span="6">
                    <el-tag closable @close="removeRightById(scope.row, itme2.id)" type="success">{{ itme2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="(item3, index3) in itme2.children"
                      :key="item3.id"
                      :class="[index3 === 0 ? '' : 'topborder']"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{ scope.row.children }}</pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" align="center"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" align="center"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" align="center"></el-table-column>
        <el-table-column label="操做" align="center" width="300px">
          <template slot-scope="scpe">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="updateRoles(scpe.row.id)">编辑</el-button>
            <!--删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delRoles(scpe.row.id)">删除</el-button>
            <!--分配角色按钮-->
            <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scpe.row)">分配权限</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--添加弹出层-->
    <el-dialog title="添加角色" :visible.sync="roleVisible" @close="addRolesClosed">
      <el-form ref="addrolesRef" :model="addRoles" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoles.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoles.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="roleVisible = false">取 消</el-button>
        <el-button type="primary" @click="getAddrolesList">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改弹出层-->
    <el-dialog title="修改角色" :visible.sync="uproleVisible" @close="upRolesClosed">
      <el-form ref="rolesupdateRef" :model="selectRoleByid" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="selectRoleByid.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="selectRoleByid.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="uproleVisible = false">取 消</el-button>
        <el-button type="primary" @click="getUpdateRoles(selectRoleByid.roleId)">确 定</el-button>
      </span>
    </el-dialog>

    <!--角色分配弹出层-->
    <el-dialog title="分配权限" :visible.sync="selecttreeVisible" width="50%" @close="setRightDialongClosed">
      <el-tree :data="treeList" :props="treeProps" node-key="id" show-checkbox :default-expand-all="true" :default-checked-keys="defKeys" ref="tressnode"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="selecttreeVisible = false">取 消</el-button>
        <el-button type="primary" @click="oktreeRolechecked">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { get, post, put, deletefn } from '../../assets/js/request';
import api from '../../assets/js/api';
export default {
  data() {
    return {
      rolesList: [],
      roleVisible: false,
      addRoles: {
        roleName: '',
        roleDesc: ''
      },
      selectRoleByid: {},
      uproleVisible: false,
      selecttreeVisible: false,
      treeList: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      //角色id
      roleId: ''
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //数据渲染
    async getRolesList() {
      let res = await get(api.roles);
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败!');
      }
      this.rolesList = res.data;
    },
    //添加数据
    async getAddrolesList() {
      let res = await post(api.roles, this.addRoles);
      // console.log(1111, res);
      if (res.meta.status !== 201) {
        return this.$message.error('创建失败');
      }
      this.$message.success('创建成功!');
      this.roleVisible = false;
      this.getRolesList();
    },
    //编辑数据时候进行数据查询
    async updateRoles(id) {
      this.uproleVisible = true;
      let res = await get(api.roles + `/${id}`);
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('打开编辑失败');
      }
      this.selectRoleByid = res.data;
    },
    //添加时后关闭清除数据
    addRolesClosed() {
      this.$refs.addrolesRef.resetFields();
    },

    //编辑进行修改
    async getUpdateRoles(roleId) {
      let date = {
        roleName: this.selectRoleByid.roleName,
        roleDesc: this.selectRoleByid.roleDesc
      };
      let res = await put(api.roles + `/${roleId}`, date);
      if (res.meta.status !== 200) {
        return this.$message.error('修改失败!');
      }
      this.$message.success('修改成功 !');
      this.getRolesList();
      this.uproleVisible = false;
    },
    //关闭时清除数据
    upRolesClosed() {
      // console.log(this.$refs.rolesRef.resetFields());
      this.$refs.rolesupdateRef.resetFields();
    },
    //删除数据
    async delRoles(id) {
      let confir = await this.$confirm('此操作将永久该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      if (confir !== 'confirm') {
        return this.$message.error('已经取消删除！');
      }
      let res = await deletefn(api.roles + `/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色信息失败!');
      }
      this.$message.success('删除用户信息成功!');
      this.getRolesList();
    },
    //根据id删除对应的权限
    async removeRightById(role, rightId) {
      //弹窗确认是否删除
      let confim = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      if (confim != 'confirm') {
        return this.$message.info('你已经取消了删除');
      }
      // console.log(role);
      let res = await deletefn(api.roles + `/${role.id}/rights/${rightId}`);
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败!');
      }
      role.children = res.data;
    },

    //所有权限列表
    async showSetRightDialog(role) {
      this.roleId = role.id;
      let res = await get(api.rights + '/tree');
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败');
      }
      this.$message.success('获取数据成功');
      this.treeList = res.data;
      //递归获取三级节点
      this.getLeafKeys(role, this.defKeys);
      // console.log(11111, res);
      this.selecttreeVisible = true;
      // let res=await get(api.rights)
    },
    //默认选中节点的节点
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // console.log('node.children', node.children);
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => this.getLeafKeys(item, arr));
    },
    //监听分配权限对话框的关闭事件
    setRightDialongClosed() {
      this.defKeys = [];
    },
    //监听权限分确定事件
    async oktreeRolechecked() {
      let keys = [...this.$refs.tressnode.getCheckedKeys(), ...this.$refs.tressnode.getHalfCheckedKeys()];
      const keysT = keys.toString();
      let data = {
        rids: keysT
      };
      let res = await post(api.roles + `/${this.roleId}+/rights`, data);
      if (res.meta.status != 200) {
        return this.$message.error('请求数据失败!');
      }
      this.$message.success('更新成功!');
      this.getRolesList();
      this.selecttreeVisible = false;
    }
  }
};
</script>

<style lang="less" scoped>
.topborder {
  border-top: 1px solid #eee;
}
.bottomborder {
  border-bottom: 1px solid #eee;
}
.el-tag {
  margin: 7px;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
