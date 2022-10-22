<script setup>
// import { RouterLink, RouterView } from "vue-router";
import { Search, Upload } from "@element-plus/icons-vue";
import { ElContainer, ElHeader, ElMain, ElInput, ElButton, ElRate, ElTable, ElTableColumn, ElNotification, ElLoading } from "element-plus";
import { ref } from "vue";
import { getFuzzyLiterature, deleteLiterature, rateLiterature, getHisRate, editLiterature } from "@/api/api";

const colors = ref(["#99A9BF", "#F7BA2A", "#FF9900"]); // 评分框的颜色
const tableData = ref([]); // 中部表格
const loading = ref(false); // 表格加载
const input = ref(""); // 输入框
const dialogFormVisible = ref(false); // 是否显示对话框
const selectForm = ref({}); // 选中的文献用于修改
var selectID = null; // 选中的文献的序号

// 搜索文献
function search(e) {
  if (typeof e != "string") return;
  loading.value = true;
  getFuzzyLiterature(e)
    .then(res => {
      tableData.value = res;
      loading.value = false;
      console.log("[search] [%s] SUCCESS: %o", e, res);
    })
    .catch(err => {
      loading.value = false;
      console.error("[search] [%s] ERROR: %o", e, err);
    });
}

// 删除文献, 如果文献的评分大于2.5, 不允许删除
const handleDelete = (index, row) => {
  // 评分大于 2.5 不予删除
  if (row.rate > 2.5) {
    ElNotification({
      title: "Error",
      message: "评分大于 2.5, 不允许删除!",
      type: "error",
    });
    return;
  } else {
    let _loading = ElLoading.service({
      lock: true,
      text: "删除中...",
      background: "rgba(0, 0, 0, 0.7)",
    });
    deleteLiterature(JSON.parse(JSON.stringify(row)))
      .then(res => {
        _loading.close();
        console.log("[delete] SUCCESS: %o", res);
      })
      .catch(err => {
        _loading.close();
        console.error("[delete] ERROR: %o", err);
      });
  }
};

// 为文献评分
const handleRate = (index, row) => {
  let id = row.id;
  let _loading = ElLoading.service({
    lock: true,
    text: "评分中...",
    background: "rgba(0, 0, 0, 0.7)",
  });
  if (localStorage.getItem(id) == "true") {
    getHisRate(row.id)
      .then(res => {
        row.rate = res;
        _loading.close();
        ElNotification({
          title: "Error",
          message: "已经评分过了, 不允许再评分!",
          type: "error",
        });
      })
      .catch(err => {
        _loading.close();
        console.error("[rate - has_rate] ERROR: %o", err);
      });
  } else {
    rateLiterature(JSON.parse(JSON.stringify(row)))
      .then(res => {
        _loading.close();
        row.rate = res.rate;
        row.num = res.num;
        localStorage.setItem(id, "true");
        console.log("[rate] SUCCESS: %o", res);
      })
      .catch(err => {
        _loading.close();
        console.error("[rate] ERROR: %o", err);
      });
  }
};

// 处理修改
const handleEdit = (index, row) => {
  selectForm.value = JSON.parse(JSON.stringify(row));
  dialogFormVisible.value = true;
  selectID = index;
};

// 确认修改
const confirmEdit = () => {
  if (selectForm.value.eng == tableData.value[selectID].eng && selectForm.value.zh == tableData.value[selectID].zh) {
    dialogFormVisible.value = false;
  } else {
    let _loading = ElLoading.service({
      lock: true,
      text: "修改中...",
      background: "rgba(0, 0, 0, 0.7)",
    });
    editLiterature(JSON.parse(JSON.stringify(selectForm.value)))
      .then(res => {
        _loading.close();
        tableData.value[selectID].eng = selectForm.value.eng;
        tableData.value[selectID].zh = selectForm.value.zh;
        dialogFormVisible.value = false;
        console.log("[edit] SUCCESS: %o", res);
      })
      .catch(err => {
        _loading.close();
        dialogFormVisible.value = false;
        console.error("[edit] ERROR: %o", err);
      });
  }
};
</script>

<template>
  <div class="main pattern-horizontal-lines-xl">
    <el-container>
      <!-- 头部工具栏 -->
      <el-header>
        <div class="header">
          <!-- 输入框 -->
          <div class="input">
            <el-input size="large" v-model="input" @change="search" placeholder="请输入中文或英文短语">
              <template #append>
                <el-button :icon="Search" @click="search" />
              </template>
            </el-input>
          </div>
          <!-- 按钮组 -->
          <div class="add">
            <el-button size="default" round :icon="Upload">新增文献</el-button>
          </div>
        </div>
      </el-header>
      <!-- 主体部分 -->
      <el-main>
        <!-- 表格 -->
        <el-table v-loading="loading" :data="tableData" class="scale-up-center" element-loading-text="加载中..." stripe lazy>
          <!-- 序号 -->
          <el-table-column label="序号" type="index" min-width="50" fixed="left" align="center" class-name="el-table-index"></el-table-column>
          <!-- 原文 -->
          <el-table-column label="原文" min-width="500" prop="eng"></el-table-column>
          <!-- 译文 -->
          <el-table-column label="译文" min-width="500" prop="zh"></el-table-column>
          <!-- 操作组 -->
          <el-table-column label="操作" min-width="200">
            <template #default="scope">
              <div class="table-ops">
                <div class="table-ops-part1">
                  <el-button size="small" @click="handleEdit(scope.$index, scope.row)">修改</el-button>
                  <!-- <el-button size="small" type="danger" @click="handleEdit(scope.$index, scope.row)">删除</el-button> -->
                  <el-popconfirm title="确认删除?" @confirm="handleDelete(scope.$index, scope.row)">
                    <template #reference>
                      <el-button size="small" type="danger">删除</el-button>
                    </template>
                  </el-popconfirm>
                </div>
                <div class="table-ops-part2">
                  <!-- 打分 -->
                  <el-rate allow-half v-model="scope.row.rate" :colors="colors" @change="handleRate(scope.$index, scope.row)"></el-rate>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </div>

  <!-- 表单对话框 -->
  <el-dialog v-model="dialogFormVisible" title="内容校对">
    <el-form :model="selectForm">
      <el-form-item label="原文">
        <el-input v-model="selectForm.eng" autocomplete="off" />
      </el-form-item>
      <el-form-item label="译文">
        <el-input v-model="selectForm.zh" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit()">修改</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style>
.main,
.el-container {
  height: 100%;
  width: 100%;
}

.el-header {
  height: 10vh;
  padding: 0;
}

.el-main {
  height: 90vh;
  padding: 0px !important;
}

.el-header .header {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  margin-top: 10px;
}

.el-header .header .input {
  width: 50%;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
}

.el-header .header .add {
  margin-left: 10px;
}

/* 主体部分 */
.el-main .el-table {
  width: 88%;
  left: 6%;
  top: 2%;
  height: 85vh;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}

/* 表格序号列 */
.el-table-index {
  font-weight: bold !important;
}

/* 操作按钮组 */
.table-ops {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.table-ops-part1 {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.table-ops-part2 {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

/* 对话框样式 */
.dialog-footer button:first-child {
  margin-right: 10px;
}

/* 表格动画样式 */
.scale-up-center {
  -webkit-animation: scale-up-center 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045) both;
  animation: scale-up-center 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045) both;
}

@-webkit-keyframes scale-up-center {
  0% {
    -webkit-transform: scale(0.5);
    transform: scale(0.5);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}

@keyframes scale-up-center {
  0% {
    -webkit-transform: scale(0.5);
    transform: scale(0.5);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
</style>
