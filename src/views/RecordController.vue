<template>
  <div id="record-control">
    <Row>
      <div class="record-info-line">
        <span class="record-info-label">Group ID：</span>
        <span class="record-info-value">{{ groupId }}</span>
        <span class="record-info-label">Record ID：</span>
        <span class="record-info-value">{{ recordId }}</span>
        <span class="record-info-label">Record Type：</span>
        <span class="record-info-value">{{ recordType }}</span>
        <span class="record-info-label">Record State：</span>
        <span class="record-info-value">{{ recordStateList[this.$route.params.recordState] }}</span>
        <span class="record-info-label">Start Time：</span>
        <span class="record-info-value">{{ this.$route.params.startTime }}</span>
      </div>
    </Row>
    <Row class="media-layout">
      <Col span="18">
        <div class="layout-column-title">
          <span>录制布局</span>
        </div>
        <div v-show="!isAutoRecord">
          <Screen :userList="layoutMediaList"></Screen>
        </div>
        <div v-show="isAutoRecord" class="auto-record-layout">
          <div class="auto-record-layout-body">自动录制中...</div>
        </div>
      </Col>
      <Col span="6">
        <div class="media-column-title">
          <span>媒体列表</span>
        </div>
        <CheckboxGroup
          class="media-list"
          @on-change="onMediaListSelectChanged"
          v-model="selectedMediaList"
        >
          <Checkbox
            v-for="item in mediaList"
            :key="item"
            :label="item"
            :disabled="isAutoRecord"
            class="media-item"
          >
            <span>{{ item }}</span>
          </Checkbox>
        </CheckboxGroup>
        <div class="set-layout">
          <Button
            v-show="this.$route.params.recordType == 'manual'"
            shape="circle"
            type="primary"
            style="height: 36px; width: 180px; margin-top: 20px;"
            @click="setLayout"
          >设置布局</Button>
        </div>
      </Col>
    </Row>

    <div class="show-info-panel">
      <div class="info-list">
        <div
          v-for="(item, index) in infoList"
          :key="index"
          class="info-item"
        >
          <span class="time">{{item.time}}</span>
          <span :class="[item.status === 0 ? 'status-success' : 'status-error']">{{item.statusStr}}</span>
          <span class="info">-{{item.msg}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import Screen from "../components/Screen";
import { simpleDateFormat } from "../lib/dateUtil";

export default {
  data() {
    return {
      appId: localStorage.getItem("appId"),
      recordStateList: [
        "错误",
        "初始化",
        "录制中",
        "排队中",
        "编码中",
        "上传中",
        "完成"
      ],
      mediaTypeMap: {
        屏幕共享: 0,
        音频: 1,
        视频: 2
      },
      // 是否是自动录制
      isAutoRecord: this.$route.params.recordType == "auto",
      // 选择的视频和屏幕共享个数
      selectedVideoCount: 0,
      // 控制布局显示的媒体列表
      layoutMediaList: [],
      // 发送给服务器需要录制的媒体列表
      sendMediaList: [],
      // 用户选择需要录制的媒体列表
      selectedMediaList: [],
      // 用于显示的分组媒体列表
      mediaList: [],
      // 从GW服务器获取的分组全量数据，并保持实时更新
      // {{userId: xxx, mediaList: [{mediaType: xxx, mediaId: xxx}]}}
      groupFullDoseData: new Map(),
      // 录制分组ID
      groupId: this.$route.params.groupId,
      // 录制任务ID
      recordId: this.$route.params.recordId,
      // 录制任务类型：'auto'/'manual'
      recordType: this.$route.params.recordType,
      // 视频布局模板
      mediaLayoutTemplate: [
        [{ x: 0, y: 0, w: 1920, h: 1080 }], // 0
        [{ x: 0, y: 0, w: 1920, h: 1080 }], // 1
        [{ x: 0, y: 0, w: 960, h: 1080 }, { x: 960, y: 0, w: 960, h: 1080 }], // 2
        [
          // 3
          { x: 0, y: 0, w: 960, h: 540 },
          { x: 960, y: 0, w: 960, h: 540 },
          { x: 0, y: 540, w: 960, h: 540 },
          { x: 960, y: 540, w: 960, h: 540 }
        ],
        [
          // 4
          { x: 0, y: 0, w: 960, h: 540 },
          { x: 960, y: 0, w: 960, h: 540 },
          { x: 0, y: 540, w: 960, h: 540 },
          { x: 960, y: 540, w: 960, h: 540 }
        ]
      ],
      // 任务参数
      recordParams: null,
      // 提示信息
      infoList: []
    };
  },

  components: { Screen },

  mounted() {
    this.$parent.recSocket.onmessage = this.recSocketOnmessage;
    this.$parent.gwSocket.onmessage = this.gwSocketOnmessage;

    // 不管是手动录制还是自动录制，都需要显示媒体列表
    this.getFullDose();

    // 获取任务参数
    this.recordParams = this.getRecordParams(this.recordId);
    if (!this.recordParams) {
      this.$Message.warning("获取任务参数失败！");
    }

    this.updateBaseAttr();
  },

  methods: {
    /**
     * 设置Header上的显示信息和按钮的跳转控制
     */
    updateBaseAttr() {
      this.$emit("updateAttr", {
        title: "录制控制",
        btnText: "返回",
        goto: "/record/manager"
      });
    },
    /**
     * 查询本地缓存获取任务信息
     * @param recordId
     */
    getRecordParams(recordId) {
      let taskMapStr = localStorage.getItem("tasks");
      if (!taskMapStr) {
        console.warn("Cannot find tasks in local storage!");
        return null;
      }

      let taskMap = JSON.parse(taskMapStr);
      if (!taskMap) {
        console.error("Parse tasks string failed: ", taskMapStr);
        return null;
      }

      return taskMap[this.appId][recordId];
    },
    /**
     * 用户选择/取消选择媒体项处理
     * @param data
     */
    onMediaListSelectChanged(data) {
      this.selectedVideoCount = 0;
      this.layoutMediaList = [];
      this.sendMediaList = [];
      for (const item of this.selectedMediaList) {
        let arr = item.split("/");
        if (arr[1] !== "音频") {
          this.layoutMediaList.push(item);
          this.selectedVideoCount++;
        }
        this.sendMediaList.push({
          userId: arr[0],
          mediaType: this.mediaTypeMap[arr[1]],
          mediaId: arr[2]
        });
      }
    },
    /**
     * 接收到来自GW的消息
     * @param e
     */
    gwSocketOnmessage(e) {
      let response = e.data;
      let rsp = null;
      if (
        response.id === "undefined" ||
        response.id == null ||
        response.id === "null"
      ) {
        rsp = JSON.parse(response);
      } else {
        rsp = response;
      }
      console.log("===> Event Gateway：" + JSON.stringify(rsp));
      if (rsp.id === 20102) {
        //用户广播媒体通知
        this.handleBroadcastNotice(rsp);
      } else if (rsp.id === 20103) {
        //用户停止广播通知
        this.handleStopBroadcastingNotice(rsp);
      } else if (rsp.id === 20009) {
        //获取全量响应
        if (rsp.result === 0) {
          this.handleFullDoseData(rsp.group_list);
          this.subscribe();
        } else {
          console.log("获取全量失败返回：" + rsp.message);
        }
      } else if (rsp.id === 20005) {
        //订阅增量响应
        if (rsp.result === 0) {
          console.log("订阅增量成功返回：" + rsp.message);
        } else {
          console.log("订阅增量失败返回：" + rsp.message);
        }
      } else {
        console.log("未知指令：" + rsp.id);
      }
    },
    /**
     * 更新媒体列表
     */
    updateMediaList() {
      this.mediaList = [];
      for (const [userId, mediaInfo] of this.groupFullDoseData) {
        for (const media of mediaInfo) {
          if (media.media_type == 0) {
            this.mediaList.push(
              userId + "/" + "屏幕共享" + "/" + media.media_id
            );
          } else if (media.media_type == 1) {
            this.mediaList.push(userId + "/" + "音频" + "/" + media.media_id);
          } else if (media.media_type == 2) {
            this.mediaList.push(userId + "/" + "视频" + "/" + media.media_id);
          } else {
            console.warn("Invalid media type: ", media.media_type);
          }
        }
      }
    },
    /**
     * 处理全量数据
     */
    handleFullDoseData(groupList) {
      if (groupList == null && groupList.length == "undefined") {
        console.error("Invalid full-dose data: ", groupList);
        return;
      }
      // 遍历全量分组数据，查找所需分组的数据保存起来
      for (const group of groupList) {
        console.warn("group:", group.group_id);
        if (group.group_id === this.groupId) {
          for (const user of group.user_list) {
            console.warn("user: ", user.user_id);
            this.groupFullDoseData.set(user.user_id, user.media_info);
          }
        }
      }
      this.updateMediaList();
    },
    /**
     * 获取全量数据
     */
    getFullDose() {
      if (this.fullDoseResult == null || this.fullDoseResult.length === 0) {
        let params = {
          id: 20008
        };
        this.gwSocketSend(params);
      }
    },
    /**
     * 订阅增量通知
     */
    subscribe() {
      let params = {
        id: 20004
      };
      this.gwSocketSend(params);
    },
    /**
     * 发送消息给GW服务器
     * @param params
     */
    gwSocketSend(params) {
      params.business = "EP";
      params.seq_id = new Date().getTime();
      let paramsStr = JSON.stringify(params);
      console.log("<=== Event Gateway：" + paramsStr);
      this.$parent.gwSocket.send(paramsStr);
    },
    /**
     * 处理用户广播媒体通知
     * @param rsp
     */
    handleBroadcastNotice(rsp) {
      if (rsp.group_id !== this.groupId) {
        console.warn("不是所录制分组的增量数据！");
        return;
      }
      // 从全量数据中查找用户和媒体
      let userMediaInfo = this.groupFullDoseData.get(rsp.user_id);
      if (!userMediaInfo) {
        // 没找到用户，直接添加即可
        this.groupFullDoseData.set(rsp.user_id, [
          {
            media_id: rsp.media_id,
            media_type: rsp.media_type
          }
        ]);
      } else {
        // 找到用户，则看媒体是否已经存在，不存在则添加
        for (const media of userMediaInfo) {
          if (
            media.media_id == rsp.media_id &&
            media.media_type == rsp.media_type
          ) {
            console.warn("Media exists: ", JSON.stringify(media));
            return;
          }
        }
        userMediaInfo.push({
          media_id: rsp.media_id,
          media_type: rsp.media_type
        });
      }
      this.updateMediaList();
    },
    /**
     * 用户停止广播通知
     * @param rsp
     */
    handleStopBroadcastingNotice(rsp) {
      if (rsp.group_id !== this.groupId) {
        console.warn("不是所录制分组的增量数据！");
        return;
      }
      // 从全量数据中查找用户和媒体
      let userMediaInfo = this.groupFullDoseData.get(rsp.user_id);
      if (!userMediaInfo) {
        console.warn("Cannot find user while stop broadcast media!");
        return;
      }

      for (let i = 0; i < userMediaInfo.length; i++) {
        if (
          userMediaInfo[i].media_id == rsp.media_id &&
          userMediaInfo[i].media_type == rsp.media_type
        ) {
          userMediaInfo.splice(i, 1);
        }
      }
      this.updateMediaList();
    },
    /**
     * 设置布局
     */
    setLayout() {
      if (this.recordId == null || this.recordId.length === 0) {
        this.$Message.warning("Record ID不能为空！");
        return;
      }

      if (this.sendMediaList.length <= 0) {
        this.$Message.warning("未选择任何媒体！");
        return;
      }

      if (this.selectedVideoCount > 4) {
        this.$Message.warning("最多允许同时录制4路视频和屏幕共享！");
        return;
      }

      let videoList = [];
      let audioList = [];
      let mediaIndex = 0;
      let mediaLayout = this.mediaLayoutTemplate[this.selectedVideoCount];
      console.warn("$$$$ mediaLayout: " + mediaLayout + " videoCount: " + this.selectedVideoCount);
      for (const item of this.sendMediaList) {
        if (item.mediaType === 0 || item.mediaType === 2) {
          // 视频和屏幕共享
          let videoListItem = {
            user_id: item.userId,
            media_id: item.mediaId,
            media_type: item.mediaType,
            crop_mode: this.recordParams.videoCropMode
          };
          console.warn("#### index: ", mediaIndex);
          videoListItem.x = mediaLayout[mediaIndex].x;
          videoListItem.y = mediaLayout[mediaIndex].y;
          videoListItem.w = mediaLayout[mediaIndex].w;
          videoListItem.h = mediaLayout[mediaIndex].h;

          videoList.push(videoListItem);
          mediaIndex++;
        } else if (item.mediaType === 1) {
          // 音频
          let audioListItem = {
            user_id: item.userId,
            media_id: item.mediaId,
            media_type: item.mediaType
          };
          audioList.push(audioListItem);
        }
      }

      let params = {
        id: 0x1006,
        record_id: this.recordId,
        audio_list: audioList,
        video_list: videoList
      };
      this.recSocketSend(params);
    },
    /**
     * 向录制服务器发送消息
     * @param params
     */
    recSocketSend(params) {
      params.business = "RE";
      if (!params.seq) {
        params.seq = this.$streamNo();
      }
      let paramsStr = JSON.stringify(params);
      console.log("<=== Record Server：" + paramsStr);
      this.$parent.recSocket.send(paramsStr);
    },
    /**
     * 收到录制服务器消息处理
     * @param e
     */
    recSocketOnmessage(e) {
      let rsp = e.data;
      let result = null;
      if (rsp.id === "undefined" || rsp.id == null || rsp.id === "null") {
        result = JSON.parse(rsp);
      } else {
        result = rsp;
      }
      console.log("===> Record Server：" + JSON.stringify(result));
      switch (result.id) {
        case 0x2006: //设置布局
          if (result.code === 0) {
            let infoItem = {
              time: simpleDateFormat(new Date(), "yyyy/MM/dd HH:mm:ss"),
              status: 0,
              statusStr: "成功",
              msg: "开始录制，设置布局成功"
            };
            this.infoList.push(infoItem);
          } else {
            let infoItem = {
              time: simpleDateFormat(new Date(), "yyyy/MM/dd HH:mm:ss"),
              status: 1,
              statusStr: "异常",
              msg: "设置布局失败"
            };
            this.infoList.push(infoItem);
          }
          break;
        default:
          console.log("未知id：" + result.id);
          break;
      }
    }
  }
};
</script>

<style scoped>
.show-info-panel {
  height: 170px;
  background-color: #2d3451;
  margin-top: 40px;
  border-radius: 4px;
}

.layout-column-title {
  height: 40px;
  background-color: #363f61;
  margin-top: 20px;
  line-height: 40px;
  text-align: center;
  color: #8e99c7;
  font-size: 14px;
  border-radius: 4px 4px 0 0;
}

.media-column-title {
  height: 40px;
  background-color: #363f61;
  margin-top: 20px;
  line-height: 40px;
  margin-left: 10px;
  text-align: center;
  color: #8e99c7;
  font-size: 14px;
  border-radius: 4px 4px 0 0;
}

.record-info-line {
  height: 50px;
  background-color: #2d3451;
  margin-top: 20px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 50px;
}

.record-info-label {
  margin-left: 20px;
  color: #8e99c7;
}

.record-info-value {
  display: inline-block;
  color: white;
}

.record-control {
  width: 1100px;
}

.auto-record-layout {
  height: 422px;
  background-image: url("../image/auto_layout_bg.png");
  background-size: 100% 100%;
}

.auto-record-layout-body {
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-size: 16px;
  color: white;
  padding-top: 210px;
}

.voice {
  margin-top: 5px;
  color: #ffffff;
}

.media-layout {
  height: 462px;
}

.media-layout .set-layout {
  height: 76px;
  background-color: #2d3451;
  margin-left: 10px;
  border-radius: 0 0 4px 4px;
  text-align: center;
}

.media-layout .ivu-checkbox-wrapper {
  margin-right: 0;
}

.media-layout .head {
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 10px;
}

.show-info-panel .info-list {
  width: 1100px;
  height: 170px;
  padding: 20px 30px;
  overflow: auto;
  background: #2d3451;
  border-radius: 4px;
}

.show-info-panel .info-item {
  font-size: 14px;
  margin-bottom: 10px;
}

.show-info-panel .info-item:last-child {
  margin-bottom: 0;
}

.show-info-panel .time {
  color: #8e99c7;
  margin-right: 20px;
}

.show-info-panel .status-success {
  color: greenyellow;
}

.show-info-panel .status-error {
  color: #ff6d46;
}

.show-info-panel .info {
  color: #ffffff;
}

.media-layout .user {
  width: 240px;
  margin-top: 30px;
  border: 1px solid #2d3451;
  border-radius: 4px;
}

.media-layout .user-head {
  font-size: 14px;
  background: #363f61;
  color: #ffffff;
  text-align: center;
  height: 50px;
  line-height: 50px;
}

.media-layout .media-list {
  margin-left: 10px;
  height: 346px;
  background: #2d3451;
  overflow: auto;
}

.media-layout .media-item {
  display: block;
  height: 40px;
  color: #ffffff;
  line-height: 40px;
  padding-left: 20px;
  transition: background 0.2s;
  -moz-transition: background 0.2s; /* Firefox 4 */
  -webkit-transition: background 0.2s; /* Safari 和 Chrome */
  -o-transition: background 0.2s; /* Opera */
  width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-layout .media-item:hover {
  background: #4a5582;
}

.row-div-1 {
  margin-bottom: 10px;
}
</style>
