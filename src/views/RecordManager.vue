<template>
  <div id="base">
    <div class="query-line">
      <span class="query-label">Group ID:</span>
      <span class="val">
        <Input size="small" style="width: 160px;" v-model.trim="queryGroupId" />
      </span>
      <span class="query-label" style="margin-left: 30px">Record Type:</span>
      <span class="val">
        <Select v-model="queryRecordType" size="small" style="width:160px;">
          <Option
            v-for="item in recordTypeList"
            :value="item.value"
            :key="item.value"
          >{{ item.label }}</Option>
        </Select>
      </span>
      <span class="query-label" style="margin-left: 30px;">Record State:</span>
      <span class="val">
        <Select v-model="queryRecordState" size="small" style="width:160px;">
          <Option
            v-for="item in recordStateList"
            :value="item.value"
            :key="item.value"
          >{{ item.label }}</Option>
        </Select>
      </span>
      <span style="margin-left: 30px">
        <Button
          shape="circle"
          type="primary"
          style="width: 90px; height: 30px"
          @click="queryRecordList"
        >查询</Button>
        <Button
          shape="circle"
          type="primary"
          style="width: 90px; height: 30px; margin-left: 10px; background-color: #1BC38E; border: 0px"
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
    <Modal v-model="showCreateModal" title="创建录制任务" @on-ok="createRecordTask" :width="570">
      <div class="create-modal">
        <Row>
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
            <span style="margin-left: 16px; margin-right: 12px">录制模式：</span>
            <Select v-model.number="recordType" style="width: 160px">
              <Option
                v-for="item in recordTypeList"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}</Option>
            </Select>
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
      appId: localStorage.getItem("appId"),

      //////////////////////////////////////////////////////////////////////////
      // 创建录制任务对话框相关变量

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
      mainMediaType: 1,
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
      speakerUserId: "",
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
      // 自动停止录制超时时间，默认300秒
      stopRecTimeout: 300,
      // 录制模式：手动/自动
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
      // 录制文件名
      recordFileName: null,
      // 创建录制任务输入的Group ID
      recordGroupId: null,
      // 控制显示创建录制任务对话框
      showCreateModal: false,

      //////////////////////////////////////////////////////////////////////////
      // 查询相关变量

      // 录制任务状态
      queryRecordState: null,
      recordStateList: [
        { value: -1, label: "全部" },
        { value: 0, label: "错误" },
        { value: 1, label: "初始化" },
        { value: 2, label: "录制中" },
        { value: 3, label: "排队中" },
        { value: 4, label: "编码中" },
        { value: 5, label: "上传中" },
        { value: 6, label: "完成" }
      ],
      // 录制任务类型：自动/手动
      queryRecordType: null,
      // 查询Group ID
      queryGroupId: null,
      // 支持分页查询的查询参数缓存
      storeParams: {},
      //////////////////////////////////////////////////////////////////////////
      // 表格相关变量

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
          width: "130"
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
            if (params.row.recordState === 0) {
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
          width: "190",
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
                    style: "margin-right: 10px; color: #2f9bf7;"
                  },
                  on: {
                    click: () => {
                      this.pauseOrRestoreRecord(params);
                    }
                  }
                },
                params.row.pause ? "恢复" : "暂停"
              ),
              h(
                "a",
                {
                  attrs: {
                    href: "javascript:void(0);",
                    style: "margin-right: 10px; color: orange;"
                  },
                  on: {
                    click: () => {
                      this.stopRecord(params.row.recordId);
                    }
                  }
                },
                "停止"
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

    // 从“录制控制”页面返回时触发查询
    if (this.$parent.isLoginRecServer && this.$parent.isLoginEventGW) {
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
     * 点击“控制”时对录制任务进行控制
     * @param params 录制任务信息
     */
    controlRecord(params) {
      let recordType = this.getTaskType(params.row.recordId);
      if (recordType == "Unknown") {
        this.$Message.warning("未知录制类型！");
        return;
      }
      this.$router.push({ name: "controller", params: params.row });
    },
    /**
     * 暂停或恢复录制任务处理
     * @param params 录制任务信息
     */
    pauseOrRestoreRecord(params) {
      if (params.row.recordId == null || params.row.recordId.length === 0) {
        this.$Message.warning("Record ID不能为空");
        return;
      }

      let msg = { record_id: params.row.recordId };
      if (params.row.pause) {
        // 恢复操作
        msg.id = 0x1003;
      } else {
        // 暂停操作
        msg.id = 0x1004;
      }

      this.recSocketSend(msg);
    },
    /**
     * 点击“暂停/恢复”后，需要切换显示文字
     * @param recordId 录制任务信息
     * @param pause 任务是否处于暂停状态
     */
    updateRecordPauseState(recordId, pause) {
      let taskMap = this.getTaskMap();
      if (!taskMap) {
        console.error("Invalid task map!");
        return;
      }

      let appTaskMap = taskMap[this.appId];
      if (!appTaskMap) {
        console.error("Invalid app task map: ", this.appId);
        return;
      }

      let record = appTaskMap[recordId];
      if (!record) {
        console.error("Invalid record: ", recordId);
        return;
      }

      record.pause = pause;
      localStorage.setItem("tasks", JSON.stringify(taskMap));
      this.queryRecordList();
    },
    /**
     * 创建录制任务
     */
    createRecordTask() {
      if (this.recordGroupId == null || this.recordGroupId.length === 0) {
        this.$Message.warning("Group ID不能为空");
        return;
      }

      let params = {
        id: 0x1002,
        group_id: this.recordGroupId,
        file_type: this.recFileType
      };
      if (this.recordFileName != null && this.recordFileName !== "") {
        params.file_name = this.recordFileName;
      }
      if (this.stopRecTimeout != null) {
        params.timeout = this.stopRecTimeout;
      }
      if (this.frameRate != null) {
        params.frameRate = this.frameRate;
      }
      if (this.videoWidth != null) {
        params.width = this.videoWidth;
      }
      if (this.videoHeight != null) {
        params.height = this.videoHeight;
      }
      if (this.recordType === "auto") {
        params.auto = {
          type: this.layoutMode
        };
        if (this.layoutMode === 2) {
          // 主从
          if (this.speakerUserId != null && this.speakerUserId !== "") {
            params.auto.user_id = this.speakerUserId;
          }
          if (this.mainMediaType != null) {
            params.auto.main_media_type = this.mainMediaType;
          }
        }
        if (this.maxVideoCount != null) {
          params.auto.media_count = this.maxVideoCount;
        }
        if (this.cropMode != null) {
          params.auto.crop_mode = this.cropMode;
        }
        params.white_board = this.recWhiteBoard;
      }
      params.seq = Math.floor(Math.random() * 4096 + 1).toString();
      this.recSocketSend(params);
      // 录制任务结束后，录制服务器会将录制任务删除，需要本地管理录制任务
      this.saveRecordParams(params.seq);
    },
    /**
     * 保存录制任务信息
     * @param seq 消息序列号
     */
    saveRecordParams(seq) {
      let recordParams = {
        groupId: this.recordGroupId,
        fileType: this.recFileType,
        fileName: this.recordFileName,
        recordType: this.recordType,
        timeout: this.stopRecTimeout,
        videoWidth: this.videoWidth,
        videoHeight: this.videoHeight,
        videoFrameRate: this.frameRate,
        videoCropMode: this.cropMode,
        whiteBoard: this.recWhiteBoard,
        autoLayoutMode: this.layoutMode,
        speakerUserId: this.speakerUserId,
        mainMediaType: this.mainMediaType,
        maxVideoCount: this.maxVideoCount,
        startTime: "",
        stopTime: "",
        recordState: 0,
        pause: false
      };
      localStorage.setItem(seq, JSON.stringify(recordParams));
    },
    /**
     * 结束录制任务
     */
    stopRecord(recordId) {
      let params = {
        id: 0x1005,
        record_id: recordId
      };
      this.recSocketSend(params);
    },
    /**
     * 查询录制任务响应处理
     * @param recordList 服务器返回的录制任务列表
     */
    handleQueryRecordListRsp(recordList) {
      // 查询本地保存的录制任务
      let taskMap = new Object();
      let taskMapStr = localStorage.getItem("tasks");
      if (taskMapStr) {
        taskMap = JSON.parse(taskMapStr);
      } else {
        taskMap[this.appId] = new Object();
      }

      this.tabData = [];
      this.totalCount = 0;
      let appTaskMap = taskMap[this.appId];

      // 先处理本地已缓存但查询中任务已经不存在的情况
      let self = this;
      Object.keys(appTaskMap).forEach(function(recordId) {
        let find = false;
        for (const queryRecordParam of recordList) {
          if (recordId == queryRecordParam.record_id) {
            // 更新本地缓存数据
            appTaskMap[recordId].startTime = queryRecordParam.start_time;
            appTaskMap[recordId].stopTime = queryRecordParam.stop_time;
            appTaskMap[recordId].recordState = queryRecordParam.status;

            // 为了便于后续处理，添加录制任务类型
            queryRecordParam.record_type = appTaskMap[recordId].recordType;
            queryRecordParam.pause = appTaskMap[recordId].pause;

            find = true;
            break;
          }
        }
        if (!find) {
          // 本地缓存有记录，但查询不到，则应该是已经录制完成，顺便更新下本地缓存的录制任务状态
          appTaskMap[recordId].recordState = 6;

          self.tabData.push({
            groupId: appTaskMap[recordId].groupId,
            recordId: recordId,
            recordType: appTaskMap[recordId].recordType,
            recordState: appTaskMap[recordId].recordState,
            startTime: appTaskMap[recordId].startTime,
            stopTime: appTaskMap[recordId].stopTime,
            pause: appTaskMap[recordId].pause
          });
          self.totalCount++;
        }
      });

      // 更新本地缓存数据
      localStorage.setItem("tasks", JSON.stringify(taskMap));

      // 然后处理查询返回的录制任务
      for (const record of recordList) {
        this.tabData.push({
          groupId: record.group_id,
          recordId: record.record_id,
          recordType: record.record_type ? record.record_type : "Unknown",
          recordState: record.status,
          startTime: record.start_time,
          stopTime: record.stop_time,
          pause: record.pause
        });
        this.totalCount++;
      }

      // 显示table分页信息
      if (this.totalCount === 0) {
        this.tableText = "总共0条记录，每页显示";
      } else {
        let textNum =
          (this.storeParams.page - 1) * this.storeParams.page_size + 1;
        let textNum1 =
          (this.storeParams.page - 1) * this.storeParams.page_size +
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
     * 从录制服务器收到消息处理
     * @param e 收到的消息
     */
    recSocketOnmessage(e) {
      let rsp = e.data;
      let result = null;
      if (rsp.id == null || rsp.id === "undefined" || rsp.id === "null") {
        result = JSON.parse(rsp);
      } else {
        result = rsp;
      }
      console.log("===> Record Server：" + JSON.stringify(result));
      switch (result.id) {
        case 8200: //录制任务查询
          if (result.code === 0) {
            this.handleQueryRecordListRsp(
              result.total_num > 0 ? result.record_list : []
            );
          } else {
            console.error(result.msg);
          }
          break;
        case 8201: // 切换布局的主
          if (result.code === 0) {
            this.storeParams.seq = this.$streamNo();
            this.recSocketSend(this.storeParams);
          } else {
            console.error(result.msg);
          }
          break;
        case 8194: // 初始化录制任务响应
          if (result.code === 0) {
            this.$Message.success("创建录制任务成功！");
            this.updateLocalStorageTask(result.seq, result.record_id);
          } else {
            this.$Message.warning("创建录制任务失败！");
          }
          this.queryRecordList();
          break;
        case 8195: // 恢复录制响应
          if (result.code === 0) {
            this.$Message.success("恢复录制成功！");
            this.updateRecordPauseState(result.record_id, false);
          } else {
            this.$Message.warning("恢复录制失败！");
          }
          break;
        case 8196: // 暂停录制响应
          if (result.code === 0) {
            this.$Message.success("暂停录制成功！");
            this.updateRecordPauseState(result.record_id, true);
          } else {
            this.$Message.warning("暂停录制失败！");
          }
          break;
        case 8197: // 停止录制任务响应
          if (result.code === 0) {
            this.$Message.success("停止录制任务成功！");
          } else {
            this.$Message.warning("停止录制任务失败！");
          }
        default:
          console.warn("来自Record Server的未知command:" + result.id);
      }
    },
    /**
     * 基于之前保存的seq，将其替换为recordId，便于后续查询
     * @param sep 序列号
     * @param recordId 服务器返回的录制任务ID
     */
    updateLocalStorageTask(seq, recordId) {
      let recordParamStr = localStorage.getItem(seq);
      if (!recordParamStr) {
        console.error("Cannot find task info by seq: ", seq);
        return;
      } else {
        localStorage.removeItem(seq); // 临时数据可以删除了
      }

      let recordParam = JSON.parse(recordParamStr);
      if (!recordParam) {
        console.error("Parse task info failed: ", recordParamStr);
        return;
      }

      let taskMap = null;
      let taskMapStr = localStorage.getItem("tasks");
      if (!taskMapStr) {
        taskMap = new Object();
      } else {
        taskMap = JSON.parse(taskMapStr);
        if (!taskMap) {
          console.error("Parse task map failed: ", taskMapStr);
          return;
        }
      }
      taskMap[this.appId][recordId] = recordParam;
      localStorage.setItem("tasks", JSON.stringify(taskMap));
    },
    /**
     * 获取保存在本地的所有录制任务
     */
    getTaskMap() {
      let taskMapStr = localStorage.getItem("tasks");
      if (!taskMapStr) {
        console.warn("Cannot find tasks in local storage!");
        return null;
      }

      let taskMap = JSON.parse(taskMapStr);
      if (!taskMap) {
        console.error("Parse tasks string failed: ", taskMapStr);
        return null;
      } else {
        return taskMap;
      }
    },
    /**
     * 获取录制任务的录制类型：自动/手动
     * @param recordId 录制任务ID
     */
    getTaskType(recordId) {
      let taskMap = this.getTaskMap();
      if (taskMap && taskMap[this.appId]) {
        if (taskMap[this.appId][recordId]) {
          return taskMap[this.appId][recordId].recordType;
        } else {
          console.warn("Cannot find recordId: " + recordId);
          return "Unknown";
        }
      } else {
        return "Unknown";
      }
    },
    /**
     * 向录制服务器发送消息
     * @param msg 消息
     */
    recSocketSend(msg) {
      this.$parent.recSocket.onmessage = this.recSocketOnmessage;
      msg.business = "RE";
      if (!msg.seq) {
        msg.seq = this.$streamNo();
      }
      let msgStr = JSON.stringify(msg);
      console.log("<=== Record Server：" + msgStr);
      this.$parent.recSocket.send(msgStr);
    },
    /**
     * 查询录制任务
     */
    queryRecordList() {
      let params = {
        id: 0x1008,
        page: 1,
        page_size: this.pageSize
      };
      if (this.queryGroupId != null && this.queryGroupId.length !== 0) {
        params.group_id = this.queryGroupId;
      }
      if (this.queryRecordState != null && this.queryRecordState !== -1) {
        params.status = this.queryRecordState;
      }

      this.storeParams.id = params.id;
      this.storeParams.page = params.page;
      this.storeParams.page_size = params.page_size;
      this.storeParams.group_id = params.group_id;
      this.storeParams.status = params.status;

      this.recSocketSend(params);
    },
    /**
     * 删除本地保存的录制任务
     * @param recordId 录制任务ID
     */
    deleteRecord(recordId) {
      let taskMap = this.getTaskMap();
      if (taskMap) {
        let record = taskMap[this.appId][recordId];
        if (record) {
          if (record.recordState !== 0 && record.recordState !== 6) {
            this.$Message.warning("无法删除正在处理中的录制任务！");
          } else {
            delete taskMap[this.appId][recordId];
            localStorage.setItem("tasks", JSON.stringify(taskMap));
            this.$Message.success("删除录制任务成功！");
            this.queryRecordList();
          }
        } else {
          console.error("Cannot find record: ", recordId);
        }
      }
    },
    /**
     * 换页处理
     * @param page 页码
     */
    pageChange(page) {
      let params = {
        id: this.storeParams.id,
        page: page,
        page_size: this.storeParams.page_size,
        start_time: this.storeParams.start_time,
        stop_time: this.storeParams.stop_time,
        record_id: this.storeParams.record_id,
        group_id: this.storeParams.group_id,
        status: this.storeParams.status
      };
      this.storeParams.page = page;
      this.recSocketSend(params);
    },
    /**
     * 修改每页显示最大记录数处理
     * @param pageSize 每页最大显示记录数
     */
    pageSizeChange(pageSize) {
      this.pageSize = pageSize;
      let params = {
        id: this.storeParams.id,
        page: 1,
        page_size: pageSize,
        start_time: this.storeParams.start_time,
        stop_time: this.storeParams.stop_time,
        record_id: this.storeParams.record_id,
        group_id: this.storeParams.group_id,
        status: this.storeParams.status
      };
      this.storeParams.page = params.page;
      this.storeParams.page_size = pageSize;
      this.recSocketSend(params);
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
  display: flex;
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
