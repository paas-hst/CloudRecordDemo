<template>
  <div id="base">
    <div class="rec-container">
      <Header :dvlpId="dvlpId" :title="title" :btnText="btnText" :goto="goto"></Header>
      <div class="container rec-content">
        <router-view @updateAttr="updateAttr" ref="child"></router-view>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
/* eslint-disable */
import Header from "../components/Header";
import Footer from "../components/Footer";

export default {
  // 引用封装的组件
  components: {
    Header,
    Footer
  },

  data() {
    return {
      // 与事件网关的连接
      eventGwSocket: null,
      // 开发者ID
      dvlpId: localStorage.getItem("dvlpId"),
      // Header显示的title
      title: "",
      // Header右侧的button上显示的文字
      btnText: "",
      // 点击Header右侧button跳转的地址
      goto: "",
      // 是否已经成功登陆事件网关
      isLoginEventGW: false
    };
  },

  methods: {
    updateAttr(data) {
      this.title = data.title;
      this.btnText = data.btnText;
      this.goto = data.goto;
    },
    /**
     * 初始化
     */
    initGwSocket() {
      this.eventGwSocket = new WebSocket(localStorage.getItem("eventGwUrl"));
      this.eventGwSocket.onopen = this.socketOnopen;
      this.eventGwSocket.onerror = this.socketOnerror;
      this.eventGwSocket.onclose = this.socketClose;
      this.eventGwSocket.onmessage = this.socketOnmessage;
    },
    /**
     * 事件网关连接成功事件
     */
    socketOnopen() {
      console.log("连接Event Gateway成功");
      this.loginEventGateway();
    },
    /**
     * 事件网关连接失败事件
     */
    socketOnerror() {
      console.error("连接Event Gateway时发生错误");
    },
    /**
     * 事件网关连接关闭事件
     * @param e
     */
    socketClose(e) {
      console.warn("Event Gateway connection closed (" + e.code + ")");
    },
    /**
     * 接收到来自事件网关的消息
     * @param e
     */
    socketOnmessage(e) {
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
      if (rsp.id === 20001) { //登录响应
        if (rsp.result === 0) {
          console.log("登录Event Gateway成功！");
          this.isLoginEventGW = true;
          this.$refs.child.onBaseReady();
        } else {
          console.error("登录Event Gateway失败，" + rsp.message);
          this.$router.push({ path: "/login" });
        }
      } else {
        console.log("来自Event Gateway的未知指令：" + rsp.id);
      }
    },
    /**
     * 发送消息给事件网关
     * @param params
     */
    sendMsgToEventGW(params) {
      params.seq_id = new Date().getTime();
      let paramsStr = JSON.stringify(params);
      console.log("<=== Event Gateway：" + paramsStr);
      this.eventGwSocket.send(paramsStr);
    },
    /**
     * 登录事件网关
     */
    loginEventGateway() {
      let params = {
        id: 20000,
        dev_id: localStorage.getItem("dvlpId"),
        token: localStorage.getItem("accessToken")
      };
      this.sendMsgToEventGW(params);
    }
  },

  mounted() {
    if (
      this.eventGwSocket != null &&
      this.eventGwSocket.readyState === this.eventGwSocket.OPEN
    ) {
      console.warn("Event Gateway connected!");
    } else {
      this.initGwSocket();
    }
  },

  beforeDestroy() {
    this.eventGwSocket.close();
  }
};
</script>

<style>
.rec-container {
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  min-height: 100vh;
  padding-bottom: 60px;
}

/* iview input默认样式修改 */
#base .ivu-input {
  height: 30px;
  border-radius: 20px;
  background: #39446f;
  border: transparent;
  font-size: 14px;
  color: #ffffff;
  padding-left: 15px;
}

/* iview select默认样式修改 */
#base .ivu-select-small.ivu-select-single .ivu-select-selection {
  height: 30px;
  background: transparent;
  border: transparent;
}

#base .ivu-select-selection {
  background: #393939;
}

#base
  .ivu-select-small.ivu-select-single
  .ivu-select-selection
  .ivu-select-placeholder,
#base
  .ivu-select-small.ivu-select-single
  .ivu-select-selection
  .ivu-select-selected-value {
  height: 30px;
  line-height: 30px;
  background: #39446f;
  border: transparent;
  border-radius: 20px;
  font-size: 14px;
  color: #ffffff;
}

#base .ivu-select-placeholder,
#base .ivu-select-selected-value {
  padding-left: 15px;
}

/* iview checkbox默认样式修改 */
#base .ivu-checkbox-inner {
  margin-right: 10px;
}

#base .ivu-checkbox {
  font-size: 14px;
  color: #ffffff;
}

/* iview table默认样式修改 */
#base .ivu-table {
  font-size: 14px;
}

#base .ivu-table-overflowX,
#base .ivu-table-tip {
  overflow-x: hidden;
}

#base .ivu-table-wrapper,
#base .ivu-table:before,
#base .ivu-table:after {
  border: 0.1px solid #202437;
}

#base .ivu-table-header th {
  box-sizing: border-box;
  background: #4a5891;
  color: #ffffff;
  border: 1px solid #424b70;
  height: 50px;
}

#base .ivu-table td {
  box-sizing: border-box;
  background: #2d3451;
  color: #ffffff;
  border: 1px solid #424b70;
  height: 50px;
}

#base .ivu-table-row-hover td {
  background: #333b5a !important;
}

#base .ivu-table-row-highlight td {
  background: #3e466a !important;
}

#base .ivu-table-cell {
  white-space: nowrap;
}

#base .ivu-table-cell:hover {
  white-space: normal;
  text-overflow: initial;
}

#base .ivu-table td.tab-url {
  color: #2f9bf7;
}

/* iview page默认样式修改 */
#base .ivu-page-prev,
#base .ivu-page-next,
#base .ivu-page.mini .ivu-page-item {
  font-size: 12px;
  color: #8e99c7;
  background: #2d3451;
}

#base .ivu-page-item:hover a {
  color: #ebf3fe;
}

#base .ivu-page-item.ivu-page-item-active {
  background: #2f9bf7 !important;
}

#base .ivu-page-item-active a {
  color: #ebf3fe;
}

#base .ivu-page-prev a,
#base .ivu-page-next a {
  color: #ebf3fe;
}

#base .ivu-page-next.ivu-page-disabled a,
#base .ivu-page-prev.ivu-page-disabled a {
  color: #8e99c7;
}

#base .ivu-page-options input {
  background: #2d3451;
  border: 0;
  color: #ebf3fe;
}
</style>
