import http from "./http";

const getAllDepartment = () => {
  const path = "/staff/departments";
  return http.get(path);
};

const addStaff = (realname, email, password) => {
  const path = "/staff/staff";
  return http.post(path, { realname, email, password });
};

const addDepartment = (name, intro) => {
  const path = "/staff/department";
  return http.post(path, { name, intro });
};

const getStaffList = (page = 1, size = 10, paramas) => {
  const path = `/staff/staff`;
  paramas = paramas ? paramas : {};
  paramas["page"] = page;
  paramas["size"] = size;
  return http.get(path, paramas);
};

const getDepartmentList = (page = 1, size = 10, paramas) => {
  const path = "/staff/modify";
  paramas = paramas ? paramas : {};
  paramas["page"] = page;
  paramas["size"] = size;
  return http.get(path, paramas);
};

const updateStaffStatus = (staff_id, status) => {
  const path = "/staff/staff/" + staff_id;
  return http.put(path, { status });
};

const downloadStaffs = (pks) => {
  const path = "/staff/download";
  return http.downloadFile(path, { pks: JSON.stringify(pks) });
};

export default {
  getAllDepartment,
  addStaff,
  addDepartment,
  getStaffList,
  updateStaffStatus,
  downloadStaffs,
  getDepartmentList,
};
