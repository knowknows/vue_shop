<template>
  <div>
    <!---面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/rights' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--搜索框-->
      <el-row>
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable @clear="getOrderList" @input="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button> </el-input
        ></el-col>
      </el-row>
      <!--表格-->
      <el-table :data="orderList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#" size="mini"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号" size="mini"> </el-table-column>
        <el-table-column prop="order_price" label="订单价格" size="mini"> </el-table-column>
        <el-table-column label="是否付款" size="mini">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status !== '0'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" size="mini"> </el-table-column>
        <el-table-column label="下单时间" size="mini">
          <template slot-scope="scope">{{ scope.row.create_time | showDate }}</template>
        </el-table-column>
        <el-table-column label="操做" size="mini">
          <template>
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="addressVisible = true">编辑</el-button>
            <el-button type="success" size="mini" icon="el-icon-location" @click="showProgressBox">物流</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!--编辑-->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressclose">
      <el-form :model="addressForm" :rules="addressRules" ref="addressRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="省市/区/县" prop="address1">
          <el-cascader v-model="addressForm.address1" :options="citydata"></el-cascader>
          <!-- <el-input v-model="addressForm.address1"></el-input> -->
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!--这是展示物流进度的对话框-->
    <el-dialog title="物流进度" :visible.sync="progresVisible" width="50%">
      <span>这是一段信息</span>
    </el-dialog>
  </div>
</template>

<script>
import { get, post, put, deletefn } from '../../assets/js/request';
import api from '../../assets/js/api';
import { formatDate } from '../../common/utils';
import citydata from './citydata.js';
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //总页数
      total: 0,
      //数据列表
      orderList: [],
      addressVisible: false,
      addressForm: {},
      addressForm: {
        address1: '',
        address2: ''
      },
      addressRules: {
        address1: [{ required: true, message: '请输入省市/区/县', trigger: 'blur' }],
        address2: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      //这个是省市区
      citydata: citydata,
      progresVisible: false
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    async getOrderList() {
      // let res = await get(api.orders, this.queryInfo);
      let res = await get(api.orders, this.queryInfo);
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败!');
      }
      this.total = res.data.total;
      this.orderList = res.data.goods;
    },
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize;
      this.getOrderList();
    },
    handleCurrentChange(newnumber) {
      this.queryInfo.pagenum = newnumber;
      this.getOrderList();
    },
    addressclose() {
      this.$refs.addressRef.resetFields();
    },
    async showProgressBox() {
      let res = await get('/'+api.kuaidi + `/${1106975712662}`);
      console.log(1111, res);
      this.progresVisible = true;
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
.el-cascader {
  width: 100%;
}
</style>
