webpackJsonp([6,11],{BeVv:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n={data:function(){return{words:[],str:"输入名称马上开始",letters:[],order:1}},watch:{order:function(t,e){this.order%4==1&&(this.str="输入名称马上开始")}},mounted:function(){this.begin()},methods:{begin:function(){this.letters=this.str.split("");for(var t=0;t<this.letters.length;t++)setTimeout(this.write(t),200*t)},back:function(){for(var t=this.letters.length,e=0;e<t;e++)setTimeout(this.wipe(e),50*e)},write:function(t){var e=this;return function(){var i=e.letters.length;e.words.push(e.letters[t]);var n=e;t==i-1&&setTimeout(function(){n.back()},2e3)}},wipe:function(t){var e=this;return function(){if(e.words.pop(e.letters[t]),0==e.words.length){e.order++;var i=e;setTimeout(function(){i.begin()},1e3)}}}}},s={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"typer"},[i("div",{staticClass:"typer-content"},[i("p",{staticClass:"typer-static"}),t._v(" "),i("p",{staticClass:"typer-dynamic"},[i("span",{staticClass:"cut"},t._l(t.words,function(e,n){return i("span",{key:n,staticClass:"word"},[t._v(t._s(e))])}),0),t._v(" "),i("span",{staticClass:"typer-cursor"})])])])},staticRenderFns:[]};var a=i("VU/8")(n,s,!1,function(t){i("PLQJ")},"data-v-6adeb2d1",null);e.default=a.exports},BjDH:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n,s,a=i("bOdI"),o=i.n(a),r=i("Fd2+"),u=i("m4jk"),c=i("BeVv"),h=(r.i,r.d,r.j,c.default,n={goLast:function(){this.$router.go(-1)},goUser:function(){this.$router.push({path:"/user"})},onConfirm:function(t,e){this.activeId=this.columns[e].id,this.inputCateName=this.columns[e].text,this.showThree=!1},changeCate:function(t,e){this.inputCateName=e,this.activeId=t},onChange:function(t,e,i){},onCancel:function(){this.showThree=!1},goCateChoose:function(){this.showThree=!0},goBack:function(){this.showTwo=!0,this.showThree=!1},goThree:function(){void 0!==this.inputName?0!=this.activeId?this.$router.push({path:"/three",query:{active:this.activeId,name:this.inputName,slogan:this.inputSlogan}}):Object(r.i)("请选择分类！"):Object(r.i)("请输入品牌名！")},goHome:function(){this.$router.push({path:"/home"})}},o()(n,"goUser",function(){this.$router.push({path:"/user"})}),o()(n,"goCreate",function(){console.log(this.activeId),console.log(this.inputName),console.log(this.inputSlogan),this.$router.push({path:"/three",query:{active:this.activeId,name:this.inputName,slogan:this.inputSlogan}})}),o()(n,"getData",function(){var t=this;Object(u.c)().then(function(e){1==e.status?t.columns=e.data.first:Object(r.i)(e.msg)})}),{components:{Toast:r.i,Picker:r.d,TreeSelect:r.j,typing:c.default},data:function(){return{backStyle:{backgroundImage:"url("+i("jRPC")+")",backgroundRepeat:"no-repeat",backgroundPosition:"right center"},columns:[{text:"杭州",id:1},{text:"宁波",id:2},{text:"温州",id:3}],inputName:"",inputSlogan:"",inputCateName:"",showTwo:!0,showThree:!1,items:[],activeId:0,activeIndex:0}},methods:(s={goLast:function(){this.$router.go(-1)},goUser:function(){this.$router.push({path:"/user"})},onConfirm:function(t,e){this.activeId=this.columns[e].id,this.inputCateName=this.columns[e].text,this.showThree=!1},changeCate:function(t,e){this.inputCateName=e,this.activeId=t},onChange:function(t,e,i){},onCancel:function(){this.showThree=!1},goCateChoose:function(){this.showThree=!0},goBack:function(){this.showTwo=!0,this.showThree=!1},goThree:function(){void 0!==this.inputName?0!=this.activeId?this.$router.push({path:"/three",query:{active:this.activeId,name:this.inputName,slogan:this.inputSlogan}}):Object(r.i)("请选择分类！"):Object(r.i)("请输入品牌名！")},goHome:function(){this.$router.push({path:"/home"})}},o()(s,"goUser",function(){this.$router.push({path:"/user"})}),o()(s,"goCreate",function(){console.log(this.activeId),console.log(this.inputName),console.log(this.inputSlogan),this.$router.push({path:"/three",query:{active:this.activeId,name:this.inputName,slogan:this.inputSlogan}})}),o()(s,"getData",function(){var t=this;Object(u.c)().then(function(e){1==e.status?t.columns=e.data.first:Object(r.i)(e.msg)})}),s),created:function(){this.inputName=this.$route.query.name,this.getData()}}),l={render:function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticStyle:{"background-color":"#fafafa"}},[n("div",{staticClass:"head",on:{click:t.goHome}},[n("div",{staticClass:"head_left",on:{click:t.goLast}},[n("img",{staticClass:"head_logo_fixed_back",attrs:{src:i("NX5N")}})]),t._v(" "),n("div",{staticClass:"head_title"},[t._v("第一步")]),t._v(" "),n("div",{staticClass:"head_right",on:{click:t.goUser}},[n("img",{staticClass:"head_logo_fixed",attrs:{src:i("XfXs")}})]),t._v(" "),n("div",{staticClass:"solid_border"})]),t._v(" "),n("div",{directives:[{name:"show",rawName:"v-show",value:t.showTwo,expression:"showTwo"}]},[n("div",{staticClass:"two_title"},[n("typing")],1),t._v(" "),n("div",{staticClass:"wisdom_h_design"},[n("input",{directives:[{name:"model",rawName:"v-model",value:t.inputName,expression:"inputName"}],staticClass:"f-name",staticStyle:{"margin-bottom":"10px"},attrs:{type:"text",placeholder:"输入品牌名"},domProps:{value:t.inputName},on:{input:function(e){e.target.composing||(t.inputName=e.target.value)}}}),t._v(" "),n("input",{directives:[{name:"model",rawName:"v-model",value:t.inputSlogan,expression:"inputSlogan"}],staticClass:"f-name",staticStyle:{"margin-bottom":"10px"},attrs:{type:"text",placeholder:"品牌英文名称或者口号(选填)"},domProps:{value:t.inputSlogan},on:{input:function(e){e.target.composing||(t.inputSlogan=e.target.value)}}}),t._v(" "),n("input",{directives:[{name:"model",rawName:"v-model",value:t.inputCateName,expression:"inputCateName"}],staticClass:"f-name",staticStyle:{"margin-bottom":"20px"},attrs:{type:"text",readonly:"readonly",placeholder:"手动选择以下分类"},domProps:{value:t.inputCateName},on:{input:function(e){e.target.composing||(t.inputCateName=e.target.value)}}}),t._v(" "),n("div",{staticClass:"cateManyBox"},t._l(t.columns,function(e){return n("div",{key:e.id,staticClass:"oneCateBox",on:{click:function(i){return t.changeCate(e.id,e.text)}}},[t._v(t._s(e.text))])}),0),t._v(" "),n("div",{staticClass:"f-button",on:{click:function(e){return t.goThree()}}},[n("span",{style:t.backStyle},[t._v("下一步")])])])]),t._v(" "),n("div",{directives:[{name:"show",rawName:"v-show",value:t.showThree,expression:"showThree"}],staticStyle:{width:"90%","margin-left":"5%","margin-top":"50px"}},[n("van-picker",{attrs:{title:"分类","show-toolbar":"",columns:t.columns},on:{confirm:t.onConfirm,cancel:t.onCancel,change:t.onChange}})],1)])},staticRenderFns:[]},d=i("VU/8")(h,l,!1,null,null,null);e.default=d.exports},PLQJ:function(t,e){},bOdI:function(t,e,i){"use strict";e.__esModule=!0;var n,s=i("C4MV"),a=(n=s)&&n.__esModule?n:{default:n};e.default=function(t,e,i){return e in t?(0,a.default)(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}},jRPC:function(t,e){t.exports="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAHCAYAAAAMPr0FAAAAXElEQVQoU7XQsQmAQBQE0dnYlmzDIhS5UozEHqxD7EjjFcGDQ8zuu/m8YEXAbDeSzpJSrWs7AROQJC3Zi4A7YH3AMePV8A3aHoC5xEPgD7yX7Q1oa79+9cdf8H4BQGwhHXOze/AAAAAASUVORK5CYII="}});