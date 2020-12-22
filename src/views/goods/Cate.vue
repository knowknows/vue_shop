<template>
  <div>
    <!---面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/rights' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!--表格-->
      <tree-table :data="cateList" :columns="columns" border :selection-type="false" :expand-type="false" :show-index="true" index-text="序号">
        <template slot="isok" scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === true" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!---排序-->
        <template slot="desc" scope="scope">
          <el-button type="primary" size="mini" v-if="scope.row.cat_level === 0">一级</el-button>
          <el-button type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-button>
          <el-button type="warning" v-else size="mini">三级</el-button>
        </template>
        <!--操做-->
        <template slot="operation" scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="getCateByid(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row)">删除</el-button>
        </template>
      </tree-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      >
      </el-pagination>
    </el-card>
    <!--添加分类对话框-->
    <el-dialog title="添加分类" :visible.sync="addCatedialogVisible" width="50%">
      <!--添加分类的表单-->
      <el-form :model="addCateForm" :rules="addCateFormRulse" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类:">
          <!--级联选择框
          options:用来指定数据源，也就是要会显的数据
          props:用来指定配置对象,需要自己在data里进行配置
          v-model:将选中的值双向绑定到data中，而且必须是一个数组，不能只是一个值
          @change:只要级联的选择发生了变化就触发这个事件
          -->
          <el-cascader expand-trigger="hover" v-model="selectedKeys" :options="parentcCateList" :props="cascaderProps" @change="parentCateChanged" clearable change-on-select></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!--编辑类别-->
    <el-dialog title="编辑分类" :visible.sync="updatedialogVisible" width="50%" @close="updatedCateCalse">
      <el-form ref="updateRef" :model="cateNames" label-width="80px">
        <el-form-item label="编辑分类" prop="cat_name">
          <el-input v-model="cateNames.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="OkupdateCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import api from '../../assets/js/api';
import { get, put, post, deletefn } from '../../assets/js/request';
export default {
  data() {
    return {
      //商品分类列表，默认是空
      cateList: [],
      //查询条数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //总页数
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
          width: '400px'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          minWidth: '100px',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          prop: 'cat_level',
          minWidth: '100px',
          type: 'template',
          template: 'desc'
        },
        {
          label: '排序',
          // prop: "cat_level",
          minWidth: '100px',
          type: 'template',
          template: 'operation'
        }
      ],
      addCatedialogVisible: false, //是否弹出添加分类对话框
      //添加分类的数据对象
      addCateForm: {
        cat_name: '',
        //默认父分类
        cat_pid: 0,
        //分类的等级默认要添加的是1级分类
        //当前的等级
        cat_level: 0
      },
      //添加验证规则
      addCateFormRulse: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      },
      //获取所有父级分类的列表
      parentcCateList: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id', //具体选中的那个属性
        label: 'cat_name', //你所看到的哪个属性
        children: 'children' //父子嵌套用的哪个属性
      },
      //选中的父级分类的ID数组
      selectedKeys: [],
      //分类名称
      cateNames: {
        cat_name: ''
      },
      updatedialogVisible: false,
      cat_id: 0
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //初始化数据,获取所有商品的分类
    async getCateList() {
      let res = await get(api.categories, this.queryInfo);
      if (res.meta.status != 200) {
        return this.$message.error('获取商品分类失败!');
      }
      // console.log(res);
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    //监听pagesize
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize;
      this.getCateList();
    },
    //监听pagenumber 当前页码值
    handleCurrentChange(newnum) {
      this.queryInfo.pagenum = newnum;
      this.getCateList();
    },
    //点击添加分类按钮,展示对话框的按钮
    addCateDialog() {
      //先获取父级分类的数据列表
      this.getParentCateList();
      this.addCatedialogVisible = true;
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      let data = {
        type: 2
      };
      let res = await get(api.categories, data);
      if (res.meta.status != 200) {
        return this.$message.error('获取数据失败!');
      }
      // console.log(res);
      this.parentcCateList = res.data;
    },
    //选择项发生变化，触发这个函数
    parentCateChanged() {
      //this.selectedKeys.length证明有假数据
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        //证明没有选择的时候就是顶级
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
      // console.log(1111,this.selectedKeys);
      // console.log(22222,this.addCateForm);
    },
    //添加分类
    async addCate() {
      //   console.log(1111,this.selectedKeys);
      // console.log(22222,this.addCateForm);
      let res = await post(api.categories, this.addCateForm);
      console.log(res);
      if (res.meta.status !== 201) {
        return this.$message.error('添加分类失败!');
      }
      this.$message.success('添加成功!');
      this.addCatedialogVisible = false;
      this.getCateList();
    },
    //点击进去的时候进行数据渲染
    async getCateByid(cate) {
      this.updatedialogVisible = true;
      // console.log(cate);
      this.cat_id = cate.cat_id;
      let res = await get(api.categories + `/${this.cat_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败!');
      }
      this.cateNames.cat_name = res.data.cat_name;
    },
    //点击确人修改
    async OkupdateCate() {
      let data = {
        cat_name: this.cateNames.cat_name
      };
      let res = await put(api.categories + `/${this.cat_id}`, data);
      if (res.meta.status !== 200) {
        return this.$message.error('更新失败!');
      }
      this.$message.success('更新成功!');
      this.updatedialogVisible = false;
      this.getCateList();
    },
    //关闭时候清除数据
    updatedCateCalse() {
      // this.$refs.updateRef.resetFields();
    },
    //删除数据
    async deleteCate(cate) {
      let confim = await this.$confirm('你将进行永久进行修改？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '保存',
        cancelButtonText: '放弃修改'
      }).catch(err => err);
      if (confim != 'confirm') {
        return this.$message.info('你已经取消了删除');
      }

      let res = await deletefn(api.categories + `/${cate.cat_id}`);
      console.log(res);
      console.log(222, res);
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败!');
      }
      this.$message.success('删除成功!');
      this.updatedialogVisible = false;
      this.getCateList();
    }
  }
};
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
