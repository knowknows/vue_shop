<template>
  <div>
    <!---面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/rights' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片区域-->
    <el-card>
      <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 100%;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
import { get, post, put, deletefn } from '../../assets/js/request';
import api, { reports } from '../../assets/js/api';
// 1. 导入 echarts
import * as echarts from 'echarts';
//做对象合并
import _ from 'lodash';

export default {
  data() {
    return {
      //option合并
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    };
  },
  created() {},
  methods: {},
  async mounted() {
    // 3：基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'));
    let res = await get(api.reports + '/type/1');
    if (res.meta.status != 200) {
      return this.$message.error('获取折现图失去失败!');
    }
    //4:数据配置项()
    const result = _.merge(res.data, this.options);
    //5：展示数据
    myChart.setOption(result);
    console.log(result);
  }
};
</script>

<style lang="less" scoped></style>
