<template>
  <div>
    <!---面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/rights' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--头部警告区域-->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon> </el-alert>
      <el-row class="cat_opt">
        <!--选择商品分类-->
        <el-col>
          <span>请选择商品分类：</span>
          <!--选择商品的级联选择框-->
          <el-cascader v-model="selectedKeys" :options="cateList" :props="cascaderProps" @change="parentCateChanged"> </el-cascader>
        </el-col>
      </el-row>

      <!--tab页签区域
       v-model:绑定的是name
      -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!--添加动态参数的面板-->
        <el-tab-pane label="动态参数" name="many">
          <!--添加动态参数的按钮-->
          <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="AddDialogVisible = true">添加参数</el-button>
          <!--表格-->
          <el-table :data="manyTableData" style="width: 100%">
            <!--展开行-->
            <el-table-column type="expand" align="center">
              <template slot-scope="scope">
                <!--循环渲染tag标签-->
                <el-tag closable v-for="(item, index) in scope.row.attr_vals" :key="index" @close="handleClose(index, scope.row)">{{ item }}</el-tag>
                <!--输入文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--添加按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" width="200"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称"> </el-table-column>
            <el-table-column label="操做">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteClick(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--添加静态属性面板-->
        <el-tab-pane label="静态属性" name="only">
          <!--添加动态参数的按钮-->
          <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="AddDialogVisible = true">添加属性</el-button>
          <!--表格-->
          <el-table :data="onlyTableData" style="width: 100%">
            <el-table-column type="expand" align="center">
              <template slot-scope="scope">
                <!--循环渲染tag标签-->
                <el-tag closable v-for="(item, index) in scope.row.attr_vals" :key="index" @close="handleClose(index, scope.row)">{{ item }}</el-tag>
                <!--输入文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--添加按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" width="200"> </el-table-column>
            <el-table-column prop="attr_name" label="属性名称"> </el-table-column>
            <el-table-column label="操做">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteClick(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加参数的对话框-->
    <el-dialog :title="`添加${titleText}`" :visible.sync="AddDialogVisible" width="50%" @close="attrformClose">
      <el-form ref="attrformRef" :model="attrform" label-width="100px" :rules="attrformRule">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="attrform.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="Addcategories">确 定</el-button>
      </span>
    </el-dialog>

    <!--点击按钮，修改对话框-->
    <el-dialog :title="`修改${titleText}`" :visible.sync="updateDialogVisible" width="50%" @close="updateattrformClose">
      <el-form ref="updateattrformRef" :model="updateattrform" label-width="100px" :rules="updateattrformRule">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="updateattrform.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="okUpdateVisible">确 定</el-button>
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
      //商品分类列表
      cateList: [],
      selectedKeys: [],
      cascaderProps: {
        value: 'cat_id', //具体选中的那个属性
        label: 'cat_name', //你所看到的哪个属性
        children: 'children' //父子嵌套用的哪个属性
      },
      //被激活的页签名称
      activeName: 'many',
      cateCascaderList: [], //
      //挂载到 many
      manyTableData: [], //
      //挂载到 only
      onlyTableData: [],
      AddDialogVisible: false,
      attrform: {
        attr_name: ''
      },
      //这个时判断用的
      attrformRule: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ]
      },
      //控制修改框的显示和影藏
      updateDialogVisible: false,
      updateattrform: {},
      updateattrformRule: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ]
      }
      // //控制按钮与文本框的显示
      // inputVisible: false,
      // //文本框输入的值
      // inputValue: ''
    };
  },
  created() {
    //获取所有的商品分类的列表
    this.getCateList();
  },
  methods: {
    //初始化数据
    async getCateList() {
      let res = await get(api.categories);
      if (res.meta.status != 200) {
        return this.$message.error('获取商品分类失败!');
      }
      this.cateList = res.data;
      // console.log(res);
    },
    //级联选择时候监听数据
    parentCateChanged() {
      this.getParamsData();
    },
    //Tab页签点击事件的处理函数
    handleTabClick() {
      // console.log(this.activeName);
      this.getParamsData();
    },
    //获取所有参数列表
    async getParamsData() {
      //控制选中的范围
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        this.manyTableData = []; //
        //挂载到 only
        this.onlyTableData = [];
        return;
      }
      //等于3表示数据选择的是3级数据，进行数据请求
      let data = {
        sel: this.activeName
      };
      let res = await get(api.categories + `/${this.Catid}/attributes`, data);

      //这里把attr_vals从字符串变成数组
      res.data.forEach(element => {
        element.attr_vals = element.attr_vals ? element.attr_vals.split(' ') : [];
        //添加一个boolean值来控制添加还是影藏
        element.inputVisible = false;
        //文本框输入的值
        element.inputValue = '';
      });
      // console.log('res', res);
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败!');
      }
      if (this.activeName === 'many') {
        this.manyTableData = res.data; //
      } else {
        //挂载到 only
        this.onlyTableData = res.data;
      }
    },
    //关闭时清除数据
    attrformClose() {
      this.$refs.attrformRef.resetFields();
    },
    Addcategories() {
      this.$refs.attrformRef.validate(async valid => {
        if (!valid) {
          return;
        }
        let data = {
          attr_name: this.attrform.attr_name,
          attr_sel: this.activeName
        };
        let res = await post(api.categories + `/${this.Catid}/attributes`, data);
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败!');
        }
        this.$message.success('添加成功!');
        this.handleTabClick();
        this.AddDialogVisible = false;
      });
    },
    updateattrformClose() {
      this.$refs.updateattrformRef.resetFields();
    },
    async showEditDialog(attr_id) {
      //categories/:id/attributes/:attrId
      let data = {
        attr_sel: this.activeName
      };
      let res = await get(api.categories + `/${this.Catid}/attributes/${attr_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败');
      }
      this.updateattrform = res.data;
      this.updateDialogVisible = true;
    },
    //编辑完确认提交
    okUpdateVisible() {
      this.$refs.updateattrformRef.validate(async valid => {
        if (!valid) {
          return;
        }
        let data = {
          attr_name: this.updateattrform.attr_name,
          attr_sel: this.activeName
        };
        let res = await put(api.categories + `/${this.Catid}/attributes/${this.updateattrform.attr_id}`, data);
        // console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error('更新失败!');
        }
        this.$message.success('更新成功!');
        this.updateDialogVisible = false;
        this.handleTabClick();
        //categories/:id/attributes/:attrId
      });
    },
    //点击进行删除数据
    async deleteClick(attr_id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      //用户取消了操做
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除!');
      }
      let res = await deletefn(api.categories + `/${this.Catid}/attributes/${attr_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败!');
      }
      this.$message.success('删除成功!');
      this.handleTabClick();
    },
    //文本框失去焦点获取 enter都会触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = '';
        row.inputVisible = false;
        return;
      }
      //如果没有return,表示输入了正确类容
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = '';
      row.inputVisible = false;
      //需要发送请求保存这次 categories/:id/attributes/:attrId
      let data = {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ') //数组转字符串
      };
      let res = await put(api.categories + `/${this.Catid}/attributes/${row.attr_id}`, data);
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('添加失败!');
      }
      this.$message.success('修改参数项成功!');
      // console.log(row);
    },
    //点击按钮展示文本输入框
    showInput(row) {
      row.inputVisible = true;
      //让文本框自动获取焦点
      //nextTick 就是当页面上元素被渲染之后，才能执行的回调
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //删除tag对应的数据可选项
    async handleClose(index, row) {
      // console.log(index);
      // console.log(row);
      //splic会修改原数组
      row.attr_vals.splice(index, 1);
      let data = {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ') //数组转字符串
      };
      let res = await put(api.categories + `/${this.Catid}/attributes/${row.attr_id}`, data);
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('添加失败!');
      }
      this.$message.success('修改参数项成功!');
    }
  },
  computed: {
    //判断是否禁用
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true;
      }
      return false;
    },
    //三级级联选择的ID值
    Catid() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2];
      }
      return null;
    },
    //动态计算文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数';
      }
      return '静态属性';
    }
  }
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
