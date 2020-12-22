<template>
  <div>
    <!---面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/rights' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <!--这个是上面的那个⚠框-->
      <el-alert title="注意：服务端暂不提供图片上传、商品添加、编辑的提交功能，如需测试，可在本地8888端口自启服务端，具体参考Network Request URL！" type="warning" center show-icon :closable="false">
      </el-alert>
      <!--添加商品-->
      <el-row :gutter="20" class="el-rowadd">
        <el-col :span="7">
          <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加用户</el-button>
        </el-col>
      </el-row>
      <!--数据显示的表格-->
      <el-table :data="goodsList" style="width: 100%" border>
        <el-table-column type="index" label="序号"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"> </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px"> </el-table-column>
        <el-table-column label="创建时间" width="140px">
          <template slot-scope="scope">
            {{ scope.row.add_time | showDate }}
          </template>
        </el-table-column>
        <el-table-column label="操做" width="200px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delBygoodsid(scope.row.goods_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import { login } from '../../../../../Aleax/Work/mishop/src/assets/js/api';
import api from '../../assets/js/api';
import { get, put, post, deletefn } from '../../assets/js/request';
import { formatDate } from '../../common/utils';
export default {
  data() {
    return {
      //页码的数量以及查询的数据
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //将请求的数据放进来
      goodsList: [],
      total: 0
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    //查询所有Goods数据数据
    async getGoodsList() {
      let res = await get(api.goods, this.queryInfo);
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败!');
      }
      this.$message.success('获取数据成功!');
      this.goodsList = res.data.goods;
      this.total = res.data.total;
      // console.log(res);
    },
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize;
      this.getGoodsList();
    },
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage;
      this.getGoodsList();
    },
    //点击删除的时候 goods/:id
    async delBygoodsid(goods_id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      if (confirmResult !== 'confirm') {
        return this.$message.info('你已经取消了删除!');
      }
      let res = await deletefn(api.goods + `/${goods_id}`);

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败!');
      }
      this.getGoodsList();
      this.$message.success('删除成功!');
    },
    //添加的时候进入另一个页面
    goAddpage() {
      this.$router.push('/goods/add');
    }
  },
  filters: {
    showDate(value) {
      //1:先将我们时间戳传成Date对象
      const date = new Date(value * 1000);
      //2:将data进行格式化
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss');
    }
  }
};
</script>

<style lang="less" scoped>
.el-rowadd {
  margin-top: 20px;
}
</style>
