<template>
  <OADialog title="修改部门领导" v-model="dialogVisible" @submit="onSubmitEdit">
    <el-form :model="staffForm" label-width="100px"> </el-form>
  </OADialog>

  <OAMain title="部门列表">
    <el-card>
      <el-table :data="departments" ref="tableRef">
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column label="序号" width="60">
          <template #default="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>

        <el-table-column prop="name" label="部门名称"></el-table-column>

        <el-table-column prop="intro" label="部门介绍"></el-table-column>

        <el-table-column
          prop="leader.realname"
          label="部门领导"
        ></el-table-column>

        <el-table-column
          prop="manager.realname"
          label="上级领导"
        ></el-table-column>

        <el-table-column label="操作">
          <template #default="scope">
            <el-button
              type="primary"
              icon="Edit"
              circle
              @click="onEditDepartment(scope.$index)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <div style="display: flex; justify-content: space-between">
          <el-form-item label="每页：">
            <el-select v-model="page_size" size="small" style="width: 100px">
              <el-option select label="10条/页" :value="10" />
              <el-option label="20条/页" :value="20" />
            </el-select>
          </el-form-item>

          <el-pagination
            background
            layout="prev, pager, next"
            :total="pagination.total"
            v-model:current-page="pagination.page"
            :page-size="page_size"
          />
        </div>
      </template>
    </el-card>
  </OAMain>
</template>

<script setup name="stafflist">
import OAMain from "@/components/OAMain.vue";
import OADialog from "@/components/OADialog.vue";
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage, ElPagination } from "element-plus";
import staffHttp from "@/api/staffHttp";
import { useAuthStore } from "@/stores/auth";

let departments = ref([]);
let pagination = reactive({
  page: 1,
  total: 0,
});
let page_size = ref();
let filterForm = reactive({
  department_id: null,
  name: "",
  intro: "",
  leader: "",
  manager: "",
});
let tableRef = ref();

async function fetchDepartmentList(page, page_size) {
  try {
    let data = await staffHttp.getDepartmentList(page, page_size, filterForm);
    pagination.total = data.count;
    pagination.page = page;
    departments.value = data.results;
  } catch (detail) {
    ElMessage.error(detail);
  }
}

const authStore = useAuthStore();

let dialogVisible = ref(false);
let staffForm = reactive({
  status: 1,
});
let handleIndex = 0;
const BASE_URL = import.meta.env.VITE_BASE_URL;

const onEditDepartment = (index) => {
  handleIndex = index;
  dialogVisible.value = true;
  let department = departments.value[index];
  staffForm.status = staff.status;
};

const onSubmitEdit = async () => {
  let department = departments.value[handleIndex];
  try {
    let newstaff = await staffHttp.updatedepartmentstatus(
      staff.uid,
      staffForm.status
    );
    ElMessage.success("员工状态修改成功");
    dialogVisible.value = false;
    departments.value.splice(handleIndex, 1, newstaff);
  } catch (detail) {
    ElMessage.error(detail);
  }
};

onMounted(async () => {
  fetchDepartmentList(1, page_size.value);

  try {
    let data = await staffHttp.getAllDepartment();
    departments.value = data.results;
  } catch (detail) {
    ElMessage.error(detail);
  }
});

watch(
  () => pagination.page,
  async function (value) {
    fetchDepartmentList(value, page_size.value);
  }
);

watch(page_size, function (value) {
  if (pagination.page == 1) {
    fetchDepartmentList(1, value);
  } else {
    pagination.page = 1;
  }
});
</script>

<style scoped>
.my-form-inline .el-input {
  --el-input-width: 120px;
}
.my-form-inline .el-select {
  --el-select-width: 125px;
}
.el-form--inline .el-form-item {
  margin-right: 25px;
}
</style>
