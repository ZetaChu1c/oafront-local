<template>
  <OAMain title="部门管理">
    <el-card shadow="always">
      <el-form
        :rules="rules"
        :model="departmentForm"
        ref="formRef"
        label-width="80px"
      >
        <el-form-item label="部门名称" prop="name">
          <el-input
            v-model="departmentForm.name"
            placeholder="请输入部门名称"
          ></el-input>
        </el-form-item>

        <el-form-item label="部门介绍" prop="intro">
          <el-input
            v-model="departmentForm.intro"
            placeholder="请输入部门介绍"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </OAMain>
</template>

<script setup name="departmentadd">
import { ref, reactive } from "vue";
import staffHttp from "@/api/staffHttp";
import { useRouter } from "vue-router";
import OAMain from "@/components/OAMain.vue";
import { useAuthStore } from "@/stores/auth";
import { ElMessage } from "element-plus";

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref();

const onSubmit = () => {
  formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        console.log(departmentForm);

        await staffHttp.addDepartment(
          departmentForm.name,
          departmentForm.intro
        );
        ElMessage.success("部门添加成功");
        router.push({ name: "staff_list" });
      } catch (detail) {
        ElMessage.error(detail);
      }
    }
  });
};

// 只有部门leader才可以给本部门新增员工
let departmentForm = reactive({
  name: "",
  intro: "",
});

let rules = reactive({
  name: [
    {
      required: true,
      message: "请输入部门名称",
      trigger: "blur",
    },
  ],
  intro: [
    {
      required: true,
      message: "请输入部门介绍",
      trigger: "blur",
    },
  ],
});
</script>

<style scoped></style>
