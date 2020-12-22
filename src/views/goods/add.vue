<template>
  <div>
    <!---面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/rights' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图-->
    <el-card>
      <!--提示区域-->
      <el-alert title="消息提示的文案" type="info" center show-icon :closable="false"></el-alert>
      <!--步骤条区域-->
      <el-steps space :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!--tab栏区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" @tab-click="tabClicked" :before-leave="beforeTabLeave">
          <!--绘制基本信息-->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader expand-trigger="hover" v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!--渲染item项目-->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="vs" v-for="(vs, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品的属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品定位图片" name="3">
            <!--
            action:图片要上传大后台的ip的地址
            on-preview:处理图片预览事件,也就是预览事件
            on-remove:点击叉号的时候触发
            file-list:指定文件列表
            list-type:指定不同的值，显示不同的预览效果
            :on-success:监听图片上传成功
          -->
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品的类容" name="4">
            <!--富文本编辑器-->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="btnAdd">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!--图片预览-->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash';
import api from '../../assets/js/api';
import { get, put, post, deletefn } from '../../assets/js/request';
export default {
  data() {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        //商品所属的分类数组
        goods_cat: [],
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        //富文本编辑器
        goods_introduce: '',
        //图片的数组
        pics: [],
        attrs: []
      },
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请输入商品数量', trigger: 'blur' }]
      },
      //商品分类列表
      cateList: [],
      cateProps: {
        value: 'cat_id', //具体选中的那个属性
        label: 'cat_name', //你所看到的哪个属性
        children: 'children' //父子嵌套用的哪个属性
      },
      manyTableData: [],
      onlyTableData: [],
      //上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      //图片上传组件headers请求头的对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false
    };
  },
  created() {
    // console.log(22222222222222222222,window.sessionStorage.getItem('token'));
    // console.log('11111', this.headerObj.Authorization);
    this.getCateList();
  },
  methods: {
    //获取所有分类商品数据列表
    async getCateList() {
      //1.6.1
      let res = await get(api.categories);
      // console.log(11, res);
      if (res.meta.status != 200) {
        return this.$message.error('获取商品分类数据失败!');
      }
      this.cateList = res.data;
      // console.log(this.cateList);
    },
    //级联选择器变化会触发的函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
      // console.log(this.addForm.goods_cate);
    },
    //切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。
    beforeTabLeave(activeName, oldActiveName) {
      // console.log('this.addForm.goods_cate.length', this.addForm.goods_cate.length);
      // console.log('oldActiveName', oldActiveName);
      //处在第一个面板，并且级联还没有选选择的时候
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择好分类!');
        return false;
      }
    },
    //tab被选中时候触发的事件
    async tabClicked() {
      // alert(111111);
      // console.log('this.activeIndex', this.activeIndex);
      if (this.activeIndex === '1') {
        //categories/:id/attributes
        let data = {
          sel: 'many'
        };
        let res = await get(api.categories + `/${this.cateid}/attributes`, data);
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态数据失败!');
        }
        res.data.forEach(element => {
          element.attr_vals = element.attr_vals.split(' ').length === 0 ? [] : element.attr_vals.split(' ');
        });

        this.manyTableData = res.data;
        // console.log(1111, res);
      } else if (this.activeIndex === '2') {
        let data = {
          sel: 'only'
        };
        let res = await get(api.categories + `/${this.cateid}/attributes`, data);
        // console.log(2222, res);
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态数据失败!');
        }
        this.onlyTableData = res.data;
        // console.log(this.onlyTableData);
      }
    },
    //处理移除图片的操做
    handleRemove(file) {
      // console.log('file', file);
      const filePath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex(ele => {
        return ele.pic === filePath;
      });
      this.addForm.pics.splice(i, 1);
      // console.log(22222, this.addForm.pics);
      // console.log('i==========',i);
    },
    //监听图片上传成功
    handleSuccess(response) {
      // console.log('response', response);
      //1:拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      //2:push到addForm中
      this.addForm.pics.push(picInfo);
      // console.log(11111, this.addForm.pics);
    },
    //预览
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    //添加按钮
    btnAdd() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项!');
        }
        //执行添加的业务逻辑
        //1:首先需要对goods_cat进行操做，把数组转成字符串
        //如果直接这样写的话会报错，因为级联选择器规定要是数组，所以这里要用到深拷贝
        // this.addForm.goods_cate = this.addForm.goods_cate.join(',');
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(',');
        // console.log('form', form);
        this.manyTableData.forEach(ele => {
          const newInfo = {
            attr_id: ele.attr_id,
            attr_value: ele.attr_vals.join(' ')
          };
          this.addForm.attrs.push(newInfo);
        });
        this.onlyTableData.forEach(ele => {
          const newInfo = {
            attr_id: ele.attr_id,
            attr_value: ele.attr_vals
          };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;
        console.log('form', form);
        //发请求提交商品
        //商品的名称，必须是一致的
        let res = await post(api.goods, form);
        console.log('res', res);
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败!');
        }
        this.$message.success('添加成功!');
        this.$router.push('/goods');
      });
    }
  },
  computed: {
    cateid() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
    }
  }
};
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 5px 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
