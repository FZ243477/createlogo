webpackJsonp([10],{"6K2R":function(t,s,i){"use strict";Object.defineProperty(s,"__esModule",{value:!0});var n=i("Y4FN"),a=i.n(n),e={data:function(){return{clientHeight:"",contact:!1,userinfo:{}}},mounted:function(){window.addEventListener("scroll",this.handleScroll,!0),this.clientHeight=""+document.documentElement.clientHeight,window.onresize=function(){this.clientHeight=""+document.documentElement.clientHeight}},watch:{clientHeight:function(){this.changeFixed(this.clientHeight)}},methods:{changeFixed:function(t){this.$refs.homePage.style.height=t+"px"},cancel:function(){this.contact=!1},callUs:function(){this.contact=!0},goAbout:function(){this.$router.push({path:"/about"})},goLast:function(){this.$router.go(-1)},goMy:function(){this.$router.push({path:"/my"})}},created:function(){this.userinfo=a.a.get("userinfo")}},c={render:function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",[n("div",{staticClass:"user_head"},[n("div",{staticClass:"user_top",staticStyle:{"font-size":"0.5rem"}},[n("i",{staticClass:"iconfont  icon-zuojiantou",staticStyle:{"font-size":"0.7rem"},on:{click:t.goLast}}),t._v("个人中心")]),t._v(" "),n("div",{staticClass:"user_message"},[n("img",{attrs:{src:i("C8vA"),alt:""}}),t._v(" "),n("div",{staticClass:"user_m_t"},[n("p",{staticClass:"u_m_t_p1"},[t._v("软铁君")]),t._v(" "),n("p",{staticClass:"u_m_t_p2"},[t._v("这是你使用软铁的第"+t._s(t.userinfo.day)+"天")])])])]),t._v(" "),n("div",{staticClass:"user_nav_box",on:{click:t.goMy}},[n("i",{staticClass:"iconfont  u_n_b_l icon-shejijingli-"}),t._v(" "),n("p",{staticClass:"u_n_b_t"},[t._v("我的设计")]),t._v(" "),n("i",{staticClass:"iconfont  u_n_b_r icon-jiantou"})]),t._v(" "),n("div",{staticClass:"user_dashed"}),t._v(" "),t._m(0),t._v(" "),n("div",{staticClass:"user_dashed2"}),t._v(" "),n("div",{staticClass:"user_nav_box",on:{click:t.callUs}},[n("i",{staticClass:"iconfont  u_n_b_l icon-kefu"}),t._v(" "),n("p",{staticClass:"u_n_b_t"},[t._v("联系客服")]),t._v(" "),n("i",{staticClass:"iconfont  u_n_b_r icon-jiantou"})]),t._v(" "),n("div",{staticClass:"user_dashed2"}),t._v(" "),n("div",{staticClass:"user_nav_box",on:{click:t.goAbout}},[n("i",{staticClass:"iconfont  u_n_b_l icon-guanyuwomen"}),t._v(" "),n("p",{staticClass:"u_n_b_t"},[t._v("关于我们")]),t._v(" "),n("i",{staticClass:"iconfont  u_n_b_r icon-jiantou"})]),t._v(" "),n("div",{staticClass:"user_dashed2"}),t._v(" "),n("div",{directives:[{name:"show",rawName:"v-show",value:t.contact,expression:"contact"}],ref:"homePage",staticClass:"call_content"},[n("div",{staticClass:"call_box_div"},[t._m(1),t._v(" "),n("div",{staticClass:"call_box",staticStyle:{width:"100%","text-align":"center"},on:{click:t.cancel}},[n("p",[t._v("取消")])])])])])},staticRenderFns:[function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"user_nav_box"},[s("i",{staticClass:"iconfont  u_n_b_l icon-Smile"}),this._v(" "),s("p",{staticClass:"u_n_b_t"},[this._v("请给我们好评")]),this._v(" "),s("i",{staticClass:"iconfont  u_n_b_r icon-jiantou"})])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"call_box"},[s("i",{staticClass:"iconfont icon-dianhua1",staticStyle:{"margin-left":"30%"}}),this._v(" "),s("a",{attrs:{href:"tel:18891948754"}},[this._v("呼叫 18891948754")])])}]},o=i("VU/8")(e,c,!1,null,null,null);s.default=o.exports},C8vA:function(t,s,i){t.exports=i.p+"static/img/5003.0e270a9.png"}});