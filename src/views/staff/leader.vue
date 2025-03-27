<template>
  <OAMain title="部门列表">
    <el-card>
      <el-table :data="departments">
        <el-table-column label="序号" width="100">
          <template #default="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column prop="name" label="部门名称"></el-table-column>
        <el-table-column prop="intro" label="部门介绍" width="500"></el-table-column>
        <el-table-column
          prop="leader.realname"
          label="部门领导"
          width="200"
        ></el-table-column>
        <el-table-column
          prop="manager.realname"
          label="上级领导"
          width="200"
        ></el-table-column>
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

<script setup name="departmentleader">
import OAMain from "@/components/OAMain.vue";
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage, ElPagination } from "element-plus";
import staffHttp from "@/api/staffHttp";

let staffs = ref([]);
let departments = ref([]);
let pagination = reactive({
  page: 1,
  total: 0,
});
let page_size = ref(10);


async function fetchDepartmentList(page, page_size) {
  try {
    let data = await staffHttp.getDepartmentList(page, page_size);
    pagination.total = data.count;
    departments.value = data.results;
  } catch (detail) {
    ElMessage.error(detail);
  }
}

onMounted(async () => {
  fetchDepartmentList(1, page_size.value);
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

<style>
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
