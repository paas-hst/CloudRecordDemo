<template>
  <div id="base">
    <div class="rec-container">
      <Header :appId="appId" :title="title" :btnText="btnText" :goto="goto"></Header>
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
      // 与录制服务器的连接
      recSocket: null,
      // 与事件网关的连接
      gwSocket: null,
      // App ID
      appId: localStorage.getItem("appId"),
      // Header显示的title
      title: "",
      // Header右侧的button上显示的文字
      btnText: "",
      // 点击Header右侧button跳转的地址
      goto: "",
      // 是否已经成功登录录制服务器
      isLoginRecServer: false,
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
      this.xxx = "200";
      this.gwSocket = new WebSocket(
        localStorage.getItem("privateCloud") == "true"
          ? localStorage.getItem("privateGwUrl")
          : localStorage.getItem("publicGwUrl")
      );
      this.gwSocket.onopen = this.gwSocketOnopen;
      this.gwSocket.onerror = this.gwSocketOnerror;
      this.gwSocket.onclose = this.gwSocketClose;
      this.gwSocket.onmessage = this.gwSocketOnmessage;
    },
    /**
     * GW服务器连接成功事件
     */
    gwSocketOnopen() {
      console.log("连接Event Gateway成功");
      this.loginEventGateway();
    },
    /**
     * GW服务器连接失败事件
     */
    gwSocketOnerror() {
      console.error("连接Event Gateway时发生错误");
    },
    /**
     * GW服务器连接关闭事件
     * @param e
     */
    gwSocketClose(e) {
      console.warn("Event Gateway connection closed (" + e.code + ")");
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
      if (rsp.id === 20001) {
        //登录响应
        if (rsp.result === 0) {
          console.log("登录Event Gateway成功！");
          this.isLoginEventGW = true;
          if (this.isLoginRecServer) {
            this.$refs.child.onBaseReady();
          }
        } else {
          console.error("登录Event Gateway失败，" + rsp.message);
          this.$router.push({ path: "/login" });
        }
      } else {
        console.log("来自Event Gateway的未知指令：" + rsp.id);
      }
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
      this.gwSocket.send(paramsStr);
    },
    /**
     * 登录GW服务器
     */
    loginEventGateway() {
      let params = {
        id: 20000,
        app_id: localStorage.getItem("appId"),
        token: sessionStorage.getItem("token")
      };
      this.gwSocketSend(params);
    },
    /**
     * 初始化录制服务器的连接
     */
    initRecSocket() {
      this.recSocket = new WebSocket(
        localStorage.getItem("privateCloud") == "true"
          ? localStorage.getItem("privateRecUrl")
          : localStorage.getItem("publicRecUrl")
      );
      this.recSocket.onopen = this.recSocketOnopen;
      this.recSocket.onerror = this.recSocketOnerror;
      this.recSocket.onmessage = this.recSocketOnmessage;
      this.recSocket.onclose = this.recSocketClose;
    },
    /**
     * 录制服务器连接成功事件
     */
    recSocketOnopen() {
      console.log("连接Record Server成功");
      this.loginRecordServer();
    },
    /**
     * 录制服务器连接失败事件
     */
    recSocketOnerror() {
      console.error("连接Record Server发生错误");
      this.$router.push({ path: "/login" });
    },
    /**
     * 收到录制服务器的消息
     * @param e
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
      if (result.id === 0x2001) {
        if (result.code !== 0) {
          console.error("登录Record Server失败！");
          this.$router.push({ path: "/login" });
        } else {
          console.log("登录Record Server成功！");
          this.isLoginRecServer = true;
          if (this.isLoginEventGW) {
            this.$refs.child.onBaseReady();
          }
        }
      }
    },
    /**
     * 断开连接事件
     * @param e
     */
    recSocketClose(e) {
      console.warn("Record Server connection closed (" + e.code + ")");
    },
    /**
     * 登录录制服务器
     */
    loginRecordServer() {
      let params = {
        business: "RE",
        id: 0x1001,
        app_id: localStorage.getItem("appId"),
        token: sessionStorage.getItem("token"),
        seq: this.$streamNo()
      };
      this.recSocketSend(params);
    },

    /**
     * 发送消息给Rec服务器
     * @param params
     */
    recSocketSend(params) {
      let paramsStr = JSON.stringify(params);
      console.log("<=== Record Server：" + paramsStr);
      this.recSocket.send(paramsStr);
    }
  },

  mounted() {
    if (
      this.recSocket != null &&
      this.recSocket.readyState === this.recSocket.OPEN
    ) {
      console.warn("Record Server connected!");
    } else {
      this.initRecSocket();
    }
    if (
      this.gwSocket != null &&
      this.gwSocket.readyState === this.gwSocket.OPEN
    ) {
      console.warn("Event Gateway connected!");
    } else {
      this.initGwSocket();
    }
  },

  beforeDestroy() {
    this.recSocket.close();
    this.gwSocket.close();
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
