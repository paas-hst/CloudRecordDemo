<template>
  <div id="login">
    <div class="rec-logo"></div>
    <div class="login-form">
      <h2>云录制DEMO</h2>
      <div style="margin-bottom: 20px;">
        <Input
          class="login-input"
          v-model.trim="appId"
          prefix="ios-contacts"
          size="large"
          placeholder="请输入App ID"
          style="width: 300px;"
          autocomplete="on"
        />
      </div>
      <div style="margin-bottom: 20px;">
        <Input
          class="login-input"
          v-model.trim="appSecret"
          prefix="ios-contact"
          size="large"
          placeholder="请输入App Secret"
          style="width: 300px;"
          autocomplete="on"
        />
      </div>
      <div style="margin-bottom: 20px;">
        <Input
          v-show="privateCloud"
          class="login-input"
          v-model.trim="privateGwUrl"
          prefix="ios-list"
          size="large"
          placeholder="事件推送网关地址"
          style="width: 300px;"
          autocomplete="on"
        />
      </div>
      <div style="margin-bottom: 20px;">
        <Input
          v-show="privateCloud"
          class="login-input"
          v-model.trim="privateRecUrl"
          prefix="ios-list"
          size="large"
          placeholder="录制服务器地址"
          style="width: 300px;"
          autocomplete="on"
        />
      </div>
      <div>
        <Button type="primary" size="large" @click="login">登录</Button>
      </div>
      <div style="margin-top: 8px">
        <Checkbox
          v-model="privateCloud"
          style="float: right; padding-right: 50px; color: white; margin-bottom: 20px"
        >私有云</Checkbox>
      </div>
    </div>
    <div class="login-footer">
      <p>Copyright &copy; 2013-2019 hst.com. All Rights Reserved.</p>
      <p>深圳银澎云计算有限公司</p>
    </div>
  </div>
</template>

<script>
/**
 * 非Chrome浏览器进行提示
 */
if (navigator.userAgent.indexOf("Chrome") < 0) {
  this.$Message.warning({
    content: "建议使用Chrome浏览器访问！",
    duration: 15
  });
}
/**
 * 判断参数有效性
 */
function isEmpty(param) {
  if (
    param == null ||
    param === "undefined" ||
    param === "null" ||
    param.length === 0
  ) {
    return true;
  } else {
    return false;
  }
}
/* eslint-disable */
export default {
  name: "Login",
  data() {
    return {
      appId: "",
      appSecret: "",
      // 私有云录制服务器地址
      privateRecUrl: "",
      // 私有云事件推送网关地址
      privateGwUrl: "",
      // 是否是私有云
      privateCloud: false,
      // 公有云录制服务器地址
      publicRecUrl: "ws://fsp-record-gw.hst.com/",
      // 公有云事件推送网关地址
      publicGwUrl: "ws://fsp-ep.hst.com:443"
    };
  },
  methods: {
    /**
     * 登录处理
     */
    async login() {
      if (isEmpty(this.appId)) {
        this.$Message.warning("appID不能为空");
        return;
      }
      if (isEmpty(this.appSecret)) {
        this.$Message.warning("AppSecret不能为空");
        return;
      }
      if (this.privateCloud && isEmpty(this.privateRecUrl)) {
        this.$Message.warning("服务器地址不能为空");
        return;
      }
      if (this.privateCloud && isEmpty(this.privateGwUrl)) {
        this.$Message.warning("服务器地址不能为空");
        return;
      }

      // 保存用户输入
      localStorage.setItem("appId", this.appId);
      localStorage.setItem("appSecret", this.appSecret);
      localStorage.setItem("privateRecUrl", this.privateRecUrl);
      localStorage.setItem("privateGwUrl", this.privateGwUrl);
      localStorage.setItem("privateCloud", this.privateCloud);
      localStorage.setItem("publicGwUrl", this.publicGwUrl);
      localStorage.setItem("publicRecUrl", this.publicRecUrl);

      try {
        await this.getLoginToken();
        // 由于EP暂未注册到Access，这段代码先注释
        // if (!this.privateCloud) {
        //   await this.getPublicGwUrl();
        // }
        this.$router.push({ path: "/record/manager" });
      } catch (e) {
        this.$Message.error(e);
      }
    },
    /**
     * 获取登录Token
     */
    async getLoginToken() {
      let self = this;
      return new Promise((resolve, reject) => {
        fetch("https://paas-token-gen.haoshitong.com/generate/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appId: self.appId,
            appSecret: self.appSecret
          }),
          credentials: "omit"
        })
          .then(resp => {
            resp
              .json()
              .then(body => {
                if (body.code == "0") {
                  sessionStorage.setItem("token", body.result);
                  resolve();
                } else {
                  console.error(body);
                  reject("获取Token失败");
                }
              })
              .catch(e => {
                console.error(e);
                reject("获取Token失败");
              });
          })
          .catch(e => {
            console.error(e);
            reject("获取Token失败");
          });
      });
    },
    /**
     * 获取公有云事件推送网关
     */
    async getPublicGwUrl() {
      let self = this;
      return new Promise((resolve, reject) => {
        fetch("https://access.paas.hst.com/server/address?appType=8", {
          credentials: "omit"
        })
          .then(data => {
            data
              .json()
              .then(body => {
                if (body.result) {
                  self.publicGwUrl = body.result;
                  localStorage.setItem("publicGwUrl", self.publicGwUrl);
                  localStorage.setItem("publicRecUrl", self.publicRecUrl);
                  resolve();
                } else {
                  console.error(JSON.stringify(body));
                  reject("获取事件推送网关失败");
                }
              })
              .catch((e) => {
                console.error(e);
                reject("获取事件推送网关失败");
              });
          })
          .catch((e) => {
            console.error(e);
            reject("获取事件推送网关失败");
          });
      });
    }
  },
  mounted() {
    let appId = localStorage.getItem("appId");
    if (!isEmpty(appId)) {
      this.appId = appId;
    }
    let appSecret = localStorage.getItem("appSecret");
    if (!isEmpty(appSecret)) {
      this.appSecret = appSecret;
    }
    let recUrl = localStorage.getItem("privateRecUrl");
    if (!isEmpty(recUrl)) {
      this.privateRecUrl = recUrl;
    }
    let gwUrl = localStorage.getItem("privateGwUrl");
    if (!isEmpty(gwUrl)) {
      this.privateGwUrl = gwUrl;
    }
    let privateCloud = localStorage.getItem("privateCloud");
    if (!isEmpty(privateCloud)) {
      this.privateCloud = privateCloud == "true" ? true : false;
    }
  }
};
</script>

<style>
#login {
  position: relative;
  width: 100%;
  height: 100vh;
  background-image: url("../image/login_bg.jpg");
  background-size: 100% 100%;
  background-position: center center;
  background-repeat: no-repeat;
  background-color: #21253b;
}

#login .rec-logo {
  position: relative;
  top: 22px;
  left: 30px;
}

#login .login-form {
  text-align: center;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: #272f50;
  width: 500px;
  /* height: 530px; */
  border-radius: 10px;
  padding: 50px;
}

#login .login-form h2 {
  color: #ffffff;
  font-size: 40px;
  font-weight: lighter;
  margin-bottom: 50px;
}

#login .ivu-input {
  border-radius: 25px;
  background: #ffffff;
  font-size: 14px;
  color: #252830;
}

#login .ivu-btn-primary {
  width: 300px;
  height: 38px;
  border-radius: 25px;
  margin-top: 25px;
}

#login .login-footer {
  position: fixed;
  text-align: center;
  bottom: 49px;
  left: 0;
  right: 0;
  color: #4e598a;
}
</style>
