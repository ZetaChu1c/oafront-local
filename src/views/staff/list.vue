<template>
  <OADialog title="修改员工状态" v-model="dialogVisible" @submit="onSubmitEdit">
    <el-form :model="staffForm" label-width="100px">
      <el-form-item label="状态">
        <el-radio-group v-model="staffForm.status" class="m1-4">
          <el-radio :value="1">激活</el-radio>
          <el-radio :value="3">锁定</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </OADialog>

  <OAMain title="员工列表">
    <el-card>
      <el-form :inline="true" class="my-form-inline">
        <el-form-item label="按部门">
          <el-select v-model="filterForm.department_id">
            <el-option
              v-for="department in departmens"
              :label="department.name"
              :value="department.id"
              :key="department.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="按姓名">
          <el-input v-model="filterForm.realname"></el-input>
        </el-form-item>

        <el-form-item label="按入职时间">
          <el-date-picker
            v-model="filterForm.date_joined"
            type="daterange"
            range-separator="至"
            start-placeholder="起始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="search" @click="onSearch"></el-button>
        </el-form-item>

        <el-form-item>
          <el-button type="danger" icon="Download" @click="onDownload"
            >下载</el-button
          >
        </el-form-item>

        <el-form-item>
          <el-upload
            :action="BASE_URL + '/staff/upload'"
            :headers="{ Authorization: 'JWT ' + authStore.token }"
            :on-success="onUploadSuccess"
            :on-error="onUploadFail"
            :show-file-list="false"
            :auto-upload="true"
            accept=".xlsx,.xls,.csv"
          >
            <el-button type="danger" icon="Upload">上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="staffs" ref="tableRef">
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column label="序号" width="60">
          <template #default="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>

        <el-table-column prop="realname" label="姓名"></el-table-column>

        <el-table-column prop="email" label="邮箱"></el-table-column>

        <el-table-column label="入职时间">
          <template #default="scope">
            {{ timeFormatter.stringFromDate(scope.row.date_joined) }}
          </template>
        </el-table-column>

        <el-table-column prop="department.name" label="部门"></el-table-column>
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag v-if="scope.row.status == 1" type="success">正常</el-tag>
            <el-tag v-else-if="scope.row.status == 2" type="warning"
              >未激活</el-tag
            >
            <el-tag v-else type="danger">已锁定</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template #default="scope">
            <el-button
              type="primary"
              icon="Edit"
              circle
              @click="onEditStaff(scope.$index)"
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
import timeFormatter from "@/utils/timeFormatter";
import { ElMessage, ElPagination } from "element-plus";
import staffHttp from "@/api/staffHttp";
import { useAuthStore } from "@/stores/auth";

let staffs = ref([]);
let pagination = reactive({
  page: 1,
  total: 0,
});
let page_size = ref();
let dialogVisible = ref(false);
let staffForm = reactive({
  status: 1,
});
let handleIndex = 0;
let filterForm = reactive({
  department_id: null,
  realname: "",
  date_joined: [],
});
let departmens = ref({});
let tableRef = ref();

async function fetchStaffList(page, page_size) {
  try {
    let data = await staffHttp.getStaffList(page, page_size, filterForm);
    pagination.total = data.count;
    pagination.page = page;
    staffs.value = data.results;
  } catch (detail) {
    ElMessage.error(detail);
  }
}

const BASE_URL = import.meta.env.VITE_BASE_URL;

const authStore = useAuthStore();

const onEditStaff = (index) => {
  handleIndex = index;
  dialogVisible.value = true;
  let staff = staffs.value[index];
  staffForm.status = staff.status;
};

const onSearch = () => {
  fetchStaffList(1, page_size.value);
};

const onDownload = async () => {
  let rows = tableRef.value.getSelectionRows();
  if (!rows || rows.length == 0) {
    ElMessage.info("请先选中要导出的员工");
    return;
  }
  try {
    let response = await staffHttp.downloadStaffs(rows.map((row) => row.uid));
    let href = URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = href;
    a.setAttribute("download", "员工信息.xlsx");
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(href);
  } catch (detail) {
    ElMessage.error(detail);
  }
};

const onUploadSuccess = () => {
  ElMessage.success("员工上传成功");
  fetchStaffList(1, page_size.value);
};

const onUploadFail = (error) => {
  const detail = JSON.parse(error.message).detail;
  ElMessage.error(detail);
};

const onSubmitEdit = async () => {
  let staff = staffs.value[handleIndex];
  try {
    let newstaff = await staffHttp.updateStaffStatus(
      staff.uid,
      staffForm.status
    );
    ElMessage.success("员工状态修改成功");
    dialogVisible.value = false;
    staffs.value.splice(handleIndex, 1, newstaff);
  } catch (detail) {
    ElMessage.error(detail);
  }
};

onMounted(async () => {
  fetchStaffList(1, page_size.value);

  try {
    let data = await staffHttp.getAllDepartment();
    departmens.value = data.results;
  } catch (detail) {
    ElMessage.error(detail);
  }
});

watch(
  () => pagination.page,
  async function (value) {
    fetchStaffList(value, page_size.value);
  }
);

watch(page_size, function (value) {
  if (pagination.page == 1) {
    fetchStaffList(1, value);
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
