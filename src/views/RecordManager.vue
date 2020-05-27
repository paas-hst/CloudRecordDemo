<template>
  <div id="base">
    <div class="query-line">
      <span class="query-label">App ID:</span>
      <span class="val">
        <Input size="small" style="width: 300px;" v-model.trim="queryAppId" />
      </span>
      <span class="query-label" style="margin-left: 30px">Group ID:</span>
      <span class="val">
        <Input size="small" style="width: 160px;" v-model.trim="queryGroupId" />
      </span>
      <span class="query-label" style="margin-left: 30px;">Record State:</span>
      <span class="val">
        <Select v-model="queryRecordState" size="small" style="width:100px;">
          <Option
            v-for="item in queryRecordStateList"
            :value="item.value"
            :key="item.value"
          >{{ item.label }}</Option>
        </Select>
      </span>
      <span style="float:right; margin-right:10px">
        <Button
          shape="circle"
          type="primary"
          style="width: 80px; height: 30px"
          @click="queryRecordList"
        >查询</Button>
        <Button
          shape="circle"
          type="primary"
          style="width: 80px; height: 30px; margin-left: 10px; background-color: #1BC38E; border: 0px"
          @click="showCreateModal = true"
        >创建</Button>
      </span>
    </div>

    <Row class="table">
      <Table
        border
        :highlight-row="true"
        :columns="tabHeader"
        :data="tabData"
        :loading="tabLoading"
      />
    </Row>

    <Row class="tab-info">
      <Col span="12">
        <!--<span>显示第 1 到 10 条记录，总共 25 条记录 每页显示</span>-->
        <span>{{ tableText }}</span>
        <Select
          v-model="pageSize"
          size="small"
          style="width:60px; margin:0 10px"
          @on-change="pageSizeChange"
        >
          <Option v-for="i in pageSizeList" :value="i" :key="i">{{ i }}</Option>
        </Select>
        <span>条记录</span>
      </Col>
      <Col span="12" class="tar">
        <Page :total="totalCount" size="small" :page-size="pageSize" @on-change="pageChange" />
      </Col>
    </Row>

    <!-- 创建录制任务对话框 -->
    <Modal v-model="showCreateModal" title="创建录制任务" @on-ok="createRecord" :width="570">
      <div class="create-modal">
        <Row>
          <Col span="24">
            <span style="margin-left: 40px">App ID：</span>
            <Input style="width: 422px; height: 30px" v-model.trim="recordAppId" />
          </Col>
        </Row>
        <Row style="margin-top: 20px">
          <Col span="12">
            <span style="margin-left: 16px">录制分组ID：</span>
            <Input style="width: 160px; height: 30px" v-model.trim="recordGroupId" />
          </Col>
          <Col span="12">
            <span style="margin-left: 10px;">录制文件名：</span>
            <Input style="width: 160px;" v-model.trim="recordFileName" />
          </Col>
        </Row>
        <Row style="margin-top: 20px">
          <Col span="12">
            <span style="margin-left: 16px; margin-right: 12px">录制类型：</span>
            <Select v-model="recordType" style="width: 160px">
              <Option
                v-for="item in recordTypeList"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}</Option>
            </Select>
          </Col>
          <Col span="12">
            <span style="margin-left: 10px; margin-right: 12px">录制模式：</span>
            <Select v-model.number="recordMode" style="width: 160px">
              <Option
                v-for="item in recordModeList"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}</Option>
            </Select>
          </Col>
        </Row>
        <Row style="margin-top: 20px">
          <Col span="12">
            <span style="margin-left: 16px;">录制分片时长（分钟）：</span>
            <Input v-model.trim.number="recordSliceDuration" style="width: 100px;" />
          </Col>
          <Col span="12">
            <span style="margin-left: 10px;">录制自动停止超时时长（秒）：</span>
            <Input v-model.trim.number="stopRecTimeout" style="width: 64px;" />
          </Col>
        </Row>
        
        <Row style="margin-top: 20px">
          <Col span="12">
            <div class="label-div" style="margin-bottom: 2px; margin-left: 16px">视频设置</div>
            <div
              style="border:1px solid #4A578B; border-radius: 8px; width: 240px; margin-left: 16px; height: 200px;"
            >
              <div class="row-div" style="margin-top: 15px; margin-right: 10px;">
                <span style="margin-left: 15px;">视频宽度：</span>
                <Input style="width: 140px;" v-model.trim.number="videoWidth" />
              </div>
              <div class="row-div" style="margin-top: 15px; margin-right: 10px;">
                <span style="margin-left: 15px;">视频高度：</span>
                <Input style="width: 140px;" v-model.trim.number="videoHeight" />
              </div>
              <div class="row-div" style="margin-top: 15px; margin-right: 10px;">
                <span style="margin-left: 15px;">视频帧率：</span>
                <Input style="width: 90px;" v-model.trim.number="frameRate" />
                <span style="margin-left: 10px">帧/秒</span>
              </div>
              <div class="row-div" style="margin-top: 15px; margin-right: 10px;">
                <span style="margin-left: 15px;">裁剪模式：</span>
                <Select v-model.number="cropMode" style="width: 140px">
                  <Option
                    v-for="item in cropModeList"
                    :value="item.value"
                    :key="item.value"
                  >{{ item.label }}</Option>
                </Select>
              </div>
            </div>
            <div
              class="label-div"
              style="margin-top: 20px; margin-bottom: 2px; margin-left: 16px"
            >白板设置</div>
            <div
              style="border:1px solid #4A578B; border-radius: 8px; width: 240px; margin-left: 16px; height: 50px"
            >
              <div class="row-div" style="margin-top: 15px;">
                <span style="margin-left: 12px;">是否录制白板：</span>
                <RadioGroup v-model.number="recWhiteBoard">
                  <Radio :label="1">
                    <span>是</span>
                  </Radio>
                  <Radio :label="0">
                    <span>否</span>
                  </Radio>
                </RadioGroup>
              </div>
            </div>
          </Col>
          <Col span="12">
            <div class="label-div" style="margin-bottom: 2px; margin-left: 10px; ">自动录制设置</div>
            <div
              style="border:1px solid #4A578B; border-radius: 8px; width: 240px; margin-left: 10px; height: 200px"
            >
              <div class="row-div" style="margin-top: 20px, height: 30px">
                <span style="margin-left: 15px;">布局模式：</span>
                <RadioGroup v-model.number="layoutMode">
                  <Radio :label="2" :disabled="recordType == 'manual'">
                    <span>主从</span>
                  </Radio>
                  <Radio :label="1" :disabled="recordType == 'manual'">
                    <span>均分</span>
                  </Radio>
                </RadioGroup>
              </div>
              <div class="row-div">
                <span style="margin-left: 15px;">主讲用户：</span>
                <Input
                  style="width: 140px;"
                  v-model.trim="speakerUserId"
                  :disabled="layoutMode == 1 || recordType == 'manual'"
                />
              </div>
              <div class="row-div">
                <span style="margin-left: 15px;">主媒体源：</span>
                <Select
                  v-model.number="mainMediaType"
                  style="width: 140px"
                  :disabled="layoutMode == 1 || recordType == 'manual'"
                >
                  <Option
                    v-for="item in mediaTypeList"
                    :value="item.value"
                    :key="item.value"
                  >{{ item.label }}</Option>
                </Select>
              </div>
              <div class="row-div">
                <span style="margin-left: 15px;">录制路数：</span>
                <Input
                  style="width: 140px"
                  v-model.number="maxVideoCount"
                  :disabled="recordType == 'manual'"
                />
              </div>
            </div>
            <div
              class="label-div"
              style="margin-top: 20px; margin-bottom: 2px; margin-left: 10px"
            >文件设置</div>
            <div
              style="border:1px solid #4A578B; border-radius: 8px; width: 240px; margin-left: 10px; height: 50px"
            >
              <div class="row-div" style="margin-top: 15px">
                <span style="margin-left: 12px;">保存文件格式：</span>
                <RadioGroup v-model.number="recFileType">
                  <Radio :label="1">
                    <span>MP3</span>
                  </Radio>
                  <Radio :label="0">
                    <span>MP4</span>
                  </Radio>
                </RadioGroup>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  </div>
</template>

<script>
/* eslint-disable */
import { simpleDateFormat } from "../lib/dateUtil";
/* eslint-disable */
export default {
  data() {
    return {
      //////////////////////////////////////////////////////////////////////////
      // 创建录制任务对话框相关变量

      // 录制App ID
      recordAppId: null,
      // 录制分片大小（分钟）
      recordSliceDuration: 60,
      // 最大录制视频路数
      maxVideoCount: 9,
      // 视频裁剪模式
      cropMode: 1,
      cropModeList: [
        {
          value: 1,
          label: "平铺拉伸"
        },
        {
          value: 2,
          label: "等比裁剪"
        },
        {
          value: 3,
          label: "等比完整"
        }
      ],
      // 主媒体源
      mainMediaType: 0,
      mediaTypeList: [
        {
          value: 0,
          label: "屏幕共享"
        },
        {
          value: 2,
          label: "摄像头"
        },
        {
          value: 4,
          label: "白板"
        }
      ],
      // 主讲用户ID
      speakerUserId: null,
      // 布局模式：2-主从 1-均分
      layoutMode: 1,
      // 录制视频宽高（分辨率）
      videoWidth: 1920,
      videoHeight: 1080,
      frameRate: 15,
      // 是否录制白板：1-是 0-否
      recWhiteBoard: 1,
      // 录制文件保存格式：1-mp3 0-mp4
      recFileType: 0,
      // 自动停止录制超时时间，默认600秒
      stopRecTimeout: 600,
      // 录制类型：手动/自动
      recordType: "auto",
      recordTypeList: [
        {
          value: "manual",
          label: "手动录制"
        },
        {
          value: "auto",
          label: "自动录制"
        }
      ],
      // 录制模式：合流/分流
      recordMode: 0,
      recordModeList: [
        {
          value: 0,
          label: "合流"
        },
        {
          value: 1,
          label: "分流"
        }
      ],
      // 录制文件名
      recordFileName: null,
      // 创建录制任务输入的Group ID
      recordGroupId: null,
      // 控制显示创建录制任务对话框
      showCreateModal: false,

      //////////////////////////////////////////////////////////////////////////
      // 查询相关变量

      // App ID
      queryAppId: null,
      // 录制任务状态
      queryRecordState: -1,
      queryRecordStateList: [
        { value: -1, label: "全部" },
        { value: 0, label: "错误" },
        { value: 1, label: "初始化" },
        { value: 2, label: "录制中" },
        { value: 3, label: "排队中" },
        { value: 4, label: "编码中" },
        { value: 5, label: "上传中" },
        { value: 6, label: "完成" }
      ],
      // 查询Group ID
      queryGroupId: null,
      // 支持分页查询的查询参数缓存
      storeParams: {},
      //////////////////////////////////////////////////////////////////////////
      // 表格相关变量

      // 显示页码
      page: 1,
      // 每页显示数据数
      pageSize: 10,
      pageSizeList: [10, 20, 30],
      // 表格数据的排列是否升序
      order: false,
      // 表格是否处于loading状态
      tabLoading: false,
      // 表格数据
      tabData: [],
      // 表头定义
      tabHeader: [
        {
          title: "Group ID",
          key: "groupId",
          align: "center",
          width: "170"
        },
        {
          title: "Record ID",
          key: "recordId",
          align: "center",
          width: "200"
        },
        {
          title: "Record Type",
          key: "recordType",
          align: "center",
          width: "120"
        },
        {
          title: "Record State",
          align: "center",
          width: "120",
          render: (h, params) => {
            let str = "未知";
            if (params.row.recordState === -1) {
              str = "错误";
            } else if (params.row.recordState === 1) {
              str = "初始化";
            } else if (params.row.recordState === 2) {
              str = "录制中";
            } else if (params.row.recordState === 3) {
              str = "排队中";
            } else if (params.row.recordState === 4) {
              str = "编码中";
            } else if (params.row.recordState === 5) {
              str = "上传中";
            } else if (params.row.recordState === 6) {
              str = "完成";
            } else if (params.row.recordState === 7) {
              str = "暂停";
            }
            return h("p", str);
          }
        },
        {
          title: "Start Time",
          key: "startTime",
          align: "center",
          width: "170",
          sortable: true
        },
        {
          title: "Stop Time",
          key: "stopTime",
          align: "center",
          width: "170",
          sortable: true
        },
        {
          title: "Operation",
          align: "center",
          width: "150",
          render: (h, params) => {
            return h("div", [
              h(
                "a",
                {
                  attrs: {
                    href: "javascript:void(0);",
                    style: "margin-right: 10px; color: #1BC38E;"
                  },
                  on: {
                    click: () => {
                      this.controlRecord(params);
                    }
                  }
                },
                "控制"
              ),
              h(
                "a",
                {
                  attrs: {
                    href: "javascript:void(0);",
                    style: "color: #ec6049"
                  },
                  on: {
                    click: () => {
                      this.deleteRecord(params.row.recordId);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      // 总共多少条记录
      totalCount: 0,
      // 表格分页信息
      tableText: "总共0条记录，每页显示"
    };
  },

  mounted() {
    // 设置Head上相关显示属性
    this.updateBaseAttr();

    this.queryAppId = localStorage.getItem("queryAppId");

    // 从“录制控制”页面返回时触发查询
    if (this.$parent.isLoginEventGW) {
      this.queryRecordList();
    }
  },

  methods: {
    /**
     * 父组件初始化完成后通知子组件
     */
    onBaseReady() {
      this.queryRecordList();
    },
    /**
     * 设置Header显示信息及按钮点击跳转地址
     */
    updateBaseAttr() {
      this.$emit("updateAttr", {
        title: "录制管理",
        btnText: "退出",
        goto: "/login"
      });
    },
    /**
     * 构建创建录制任务参数
     */
    buildCreateRecordParams() {
      let params = {
        app_id: this.recordAppId,
        group_id: this.recordGroupId,
        file_type: this.recFileType,
        record_mode: this.recordMode,
        timeout: this.stopRecTimeout,
        file_duration: this.recordSliceDuration,
        frame_rate: this.frameRate,
        width: this.videoWidth,
        height: this.videoHeight,
        white_board: this.recWhiteBoard,
      };

      if (this.recordFileName != null && this.recordFileName !== "") {
        params.file_name = this.recordFileName;
      }
      
      if (this.recordType === "auto") {
        params.auto = {};
        params.auto.type = this.layoutMode;
        if (this.layoutMode === 2) { // 主从
          if (this.speakerUserId != null && this.speakerUserId !== "") {
            params.auto.user_id = this.speakerUserId;
          }
          params.auto.main_media_type = this.mainMediaType;
        }
        params.auto.media_count = this.maxVideoCount;
        params.auto.crop_mode = this.cropMode;
      }

      return params;
    },
    /**
     * 创建录制任务
     */
    createRecord() {
      if (this.recordGroupId == null || this.recordGroupId.length === 0) {
        this.$Message.warning("Group ID不能为空");
        return;
      } else if (this.recordAppId == null || this.recordAppId.length === 0) {
        this.$Message.warning("App ID不能为空");
        return;
      }

      fetch(localStorage.getItem("businessGwUrl") + "/v1/record/init", {
        method: "POST",
        headers: {
          authorization: localStorage.getItem("accessToken"),
          "content-type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify(this.buildCreateRecordParams())
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          this.$Message.error("创建录制任务失败！");
        })
        .then(data => {
          if (data.code === 0) {
            this.$Message.success("创建录制任务成功！");
          } else {
            this.$Message.error("创建录制任务失败！");
          }
        })
        .catch(err => {
          this.$Message.error("创建录制任务失败！");
          console.log(err);
        });

    },
    /**
     * 查询录制任务响应处理
     * @param recordList 服务器返回的录制任务列表
     */
    handleQueryRecordListRsp(totalNum, recordList) {
      this.tabData = [];
      this.totalCount = totalNum;

      for (const record of recordList) {
        this.tabData.push({
          groupId: record.group_id,
          recordId: record.record_id,
          recordType: record.auto ? "auto" : "manual",
          recordState: record.status,
          startTime: record.start_time,
          stopTime: record.stop_time,
        });
      }

      // 显示table分页信息
      if (this.totalCount === 0) {
        this.tableText = "总共0条记录，每页显示";
      } else {
        let textNum =
          (this.page - 1) * this.pageSize + 1;
        let textNum1 =
          (this.page - 1) * this.pageSize +
          this.tabData.length;
        this.tableText =
          "显示第" +
          textNum +
          "到第" +
          textNum1 +
          "条记录，总共" +
          this.totalCount +
          "条记录，每页显示";
      }
    },
    /**
     * 构建查询URL
     */
    buildQueryRecordListUrl() {
      let url = localStorage.getItem("businessGwUrl") + "/v1/record/task/list";
      
      // App ID
      url += ("?" + "app_id=" + this.queryAppId);

      // Group ID
      if (this.queryGroupId !== null && this.queryGroupId.length !== 0) {
        url += ("&group_id=" + this.queryGroupId);
      }

      // Record state
      if (this.queryRecordState !== -1) {
        url += ("&status=" + this.queryRecordState);
      }

      // Page & page size
      url += ("&page=" + this.page + "&page_size=" + this.pageSize);

      return url;
    },
    /**
     * 查询录制任务
     */
    queryRecordList() {
      if (this.queryAppId == null || this.queryAppId.length === 0) {
        this.$Message.warning("App ID不能为空");
        return;
      }
      
      localStorage.setItem("queryAppId", this.queryAppId);

      fetch(this.buildQueryRecordListUrl(), {
        headers: {
          Authorization: localStorage.getItem("accessToken")
        }
      })
        .then(resp => {
          return resp.json();
        })
        .then(resp => {
          if (resp.code === 0) {
            if (resp.total_num > 0) {
              this.handleQueryRecordListRsp(resp.total_num, resp.record_list);
            }
          } else {
            console.error("获取录制任务列表失败！");
          }
        });
    },
    /**
     * 点击“控制”时对录制任务进行控制
     * @param params 录制任务信息
     */
    controlRecord(params) {
      this.$router.push({ name: "controller", params: params.row });
    },
    /**
     * 删除本地保存的录制任务
     * @param recordId 录制任务ID
     */
    deleteRecord(recordId) {
      let param = { 
        app_id: this.queryAppId,
        mode: 1, 
        record_list: [recordId] 
      };
      fetch(localStorage.getItem("businessGwUrl") + "/v1/record/file", {
        method: "POST",
        headers: {
          authorization: localStorage.getItem("accessToken"),
          "content-type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify(param)
      })
        .then(data => {
          this.$Message.success("删除录制任务" + recordId + "成功！");
        })
        .catch(err => {
          this.$Message.error("删除录制任务" + recordId + "失败！");
          console.log(err);
        });
    },
    /**
     * 换页处理
     * @param page 页码
     */
    pageChange(page) {
      this.page = page;
      this.queryRecordList();
    },
    /**
     * 修改每页显示最大记录数处理
     * @param pageSize 每页最大显示记录数
     */
    pageSizeChange(pageSize) {
      this.queryRecordList();
    }
  }
};
</script>

<style>
.ivu-modal .ivu-modal-content {
  background-color: #272f51;
}

.ivu-modal .ivu-modal-header {
  background-color: #2e375e;
  border: 0px;
}

.ivu-modal .ivu-modal-footer {
  background-color: #2e375e;
  border: 0px;
}

.ivu-modal .ivu-btn-text {
  background-color: #39446f;
  color: white;
}

.ivu-modal .ivu-modal-footer button {
  width: 90px;
  height: 30px;
  border-radius: 15px;
  padding: 0px;
}

.ivu-modal .ivu-modal-header-inner {
  color: white;
}

.ivu-modal .ivu-input {
  height: 30px;
  background-color: #39446f;
  border: 1px #4a578b;
  color: #8e99c7;
}

.ivu-modal .ivu-select-selection {
  height: 30px;
  background-color: #39446f;
  border: 1px #4a578b;
  color: #8e99c7;
}
</style>

<style scoped>
.query-label {
  margin-right: 10px;
  margin-top: 6px;
  font-family: "MicrosoftYaHei";
}

.query-line {
  width: 1100px;
  height: 30px;
  /* display: flex; */
  vertical-align: middle;
  font-size: 14px;
  color: white;
}

.row-div {
  margin-top: 15px;
}

.order {
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  color: #ffffff;
}

.search {
  margin-top: 0px;
}

.table {
  margin-top: 20px;
  width: 1100px;
  overflow: auto;
  line-height: 24px;
}

.tab-info {
  width: 1100px;
  margin-top: 10px;
  font-size: 14px;
  color: #ffffff;
}

.create-modal {
  font-size: 12px;
  color: white;
}
</style>
