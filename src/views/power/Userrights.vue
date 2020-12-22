<template>
  <div>
    <!---面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/rights' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!---卡片视图-->
    <el-card>
      <el-table :data="rightsLists" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column label="等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level == 0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level == 1">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { get } from '../../assets/js/request';
import api from '../../assets/js/api';
export default {
  data() {
    return {
      rightsLists: []
    };
  },
  created() {
    this.rightsList();
  },
  methods: {
    async rightsList() {
      let res = await get(api.rights + '/list');
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败!');
      }
      // console.log(111, res);
      this.rightsLists = res.data;
    }
  }
};
</script>

<style></style>
