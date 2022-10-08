<a name="fF9KT"></a>
# 简介
基于vue的一个插件，进行简单配置，在不修改业务代码的情况下，可以使原生axios返回自定义模拟数据。
<a name="LXHYl"></a>
## 安装
```javascript
npm i vue-axios-mock --save
```
<a name="Od6Cj"></a>
## 演示
正常请求
```javascript
axios.get('/api/query').then(res=>{
  console.log(res)
})

//{ data:[{name:1,age:18}],success:true}
```
代理请求
```javascript
axiosMock from 'axios-hook-mock'
Vue.use(axiosMock,{ "query":[1,2,3,4,5,6,7,8,9] )
                   
//query为需要代理的部分请求url，后面为自定义返回数据
```
```javascript
axios.get('/api/query').then(res=>{
  console.log(res)
})

//[1,2,3,4,5,6,7,8,9]
```
<a name="O1PK3"></a>
# 使用
<a name="cPNAo"></a>
## 引入
```javascript
axiosMock from 'axios-hook-mock'
Vue.use(axiosMock)
```
<a name="v1Ntu"></a>
## 基础代理配置
实现一个axios请求的代理非常便捷，使用以下两种方法即可。
<a name="SOXBv"></a>
### 参数式代理
参数式代理使用时，向Vue.use(axiosMock,options)传入自定义代理选项即可。
```javascript
axiosMock from 'axios-hook-mock'
let options = {
  "query":[1,2,3,4,5,6,7,8,9],
  "api/list":{data:[],success:false}
}
Vue.use(axiosMock,options )
```
options必须是一个配置对象，每一个配置项的属性名为需要代理的请求url（模糊匹配），其属性值为自定义的模拟数据。
<a name="CyP8G"></a>
### 配置式代理
使用配置式代理时，无需在Vue.use( )中传入options选项，但是，需要在项目根目录下提供一个aMock文件夹，并在里面创建config.js配置文件。config.js的配置项同options，使用export default导出即可。
```javascript
├─ aMock
│  ├─ config.js
├─ src 
├─ public 
└─ package.json
```
config.js配置如下
```javascript
export default {
  "query":[1,2,3,4,5,6,7,8,9],
  "api/list":{data:[],success:false}
}
```
> 注：如果参数式代理和配置式代理均存在时，只使用参数式代理。

<a name="e0PlB"></a>
## 代理可选配置
每一个配置对象都是可以进行自定义设置的，您只需要在配置对象的属性名后面添加“|cus”，或 “|json”即可。
<a name="Q6jSr"></a>
### cus模式
参数式
```javascript
axiosMock from 'axios-hook-mock'
let options = {
  "pms/bill/query|cus":{
    data:[1,2,3,4,5,6,7,8,9],
    timeout:1000,
    status:200
  },
  "queryItemInfo":{data:{data:[],success:false},success:true},
}
Vue.use(axiosMock,options )
```
配置式
```javascript
export default {
    "pms/bill/query|cus":{data:[1,2,3,4,5,6,7,8,9],,timeout:1000,status:200},
    "queryItemInfo":{data:{data:[],success:false},success:true},
}
```
完成的可选配置项如下

| 参数名 | 默认值 | 释义 |
| --- | --- | --- |
| data | null | 自定义的返回数据内容 |
| mock | ture&#124;Boolen | 是否启用mock功能 |
| fuzzy | ture&#124;Boolen | 是否启用模糊查询 |
| timeout | 1000&#124;number | 自定义响应时间 |
| mockId | null&#124;string/number | 每个mock对象的唯一标识 |
| method | null&#124;string | 指定mock对象的请求方法 |
| status | 200&#124;number | 自定义返回对象的响应值 |
| responseType | axios&#124;string | 自定义返回数据的类型 |
| tip | true&#124;Boolen | 是否启用调试面板的请求提示url |
| callback | nullFfunction | 自定义返回数据的回调函数 |

<a name="gGKOK"></a>
#### data
自定义返回值，一个代理后的请求返回值结构如下<br />代理对象
```javascript
"query":{data:[1,2,3,4,5,6,7,8,9]},
```
代理后的请求
```javascript
axios.get('/api/query').then(res=>{
  console.log(res)
})

//实际返回结果
{
  config: {}
  data: {data:[1,2,3,4,5,6,7,8,9]}
  headers: {}
  request: {}
  status: 200
  statusText: "OK"
}

```
可以看见，自定义的返回值会模拟axios添加一些额外信息。如果您想单纯返回设定的值，配置中添加<br />responseType=false即可。
<a name="ZgMKe"></a>
#### responseType
mock状态下，自定义的返回值的格式如下
```javascript
"query":{data:[1,2,3,4,5,6,7,8,9]},
```
```javascript
//实际返回结果
{
  config: {}
  data: {data:[1,2,3,4,5,6,7,8,9]}
  headers: {}
  request: {}
  status: 200
  statusText: "OK"
}

```
设置为false后
```javascript
{data:[1,2,3,4,5,6,7,8,9]}
```
<a name="Il57R"></a>
#### mock
设置为false后，本条请求代理会失效。
<a name="DrcuB"></a>
#### fuzzy
默认开启模糊匹配。如query的配置名可以匹配到 [http://localhost:8080/pms/bill/query](http://localhost:8080/pms/bill/query)的请求。<br />关闭后，只有“pms/bill/query”配置名才能匹配到[http://localhost:8080/pms/bill/query](http://localhost:8080/pms/bill/query)请求。
<a name="HRmgC"></a>
#### timeout
自定义的返回值响应时间，默认为1000，您可以按需设置。
<a name="V7PYg"></a>
#### status
自定义的返回状态，这再您模拟错误的时候有用。
```javascript
"query|cus":{data:[1,2,3,4,5,6,7,8,9],status:400},
```
```javascript
axios.post('/api/query',{id:1}).then(res=>{
  console.log(res)
})

//实际返回结果
{
  config: {}
  data: [1,2,3,4,5,6,7,8,9]
  headers: {}
  request: {}
  status: 400
  statusText: "OK"
}

```
<a name="bkGFD"></a>
#### tip
默认情况下，每一次mock请求都会在控制台打印如下的信息<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/21865277/1659680273647-e91589bf-7cea-455f-8d92-50aea219616e.png#clientId=u40ef5765-55f5-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=38&id=u0dd46722&margin=%5Bobject%20Object%5D&name=image.png&originHeight=38&originWidth=920&originalType=binary&ratio=1&rotation=0&showTitle=false&size=4871&status=done&style=none&taskId=u32b662e2-a3ff-4ef2-9ad0-a6bb1975492&title=&width=920)<br />如果需要关闭，将其设置为false即可。
<a name="BAjCk"></a>
#### mockId
对于同一个代理请求，如果在项目中多次使用，即使其body请求参数不同，匹配到的模拟返回值都是一样的。<br />代理配置
```javascript
"query|cus":{
  data:{data:[{id:1,name:1},{id:2,name:2}],succees:true},
  timeout:1500,
  responseType:false
}
```
实际请求
```javascript
axios.post('/api/query',{id:1}).then(res=>{
  console.log(res)  //{data:[{id:1,name:1},{id:2,name:2}],succees:true}
})

axios.post('/api/query',{id:2}).then(res=>{
  console.log(res)   //{data:[{id:1,name:1},{id:2,name:2}],succees:true}
})
```
这两种情况返回的结果是一样的，显示不满足我们的要求。axios的第三个参数是其配置对象，基于此特性，我们可以在其配置对象中，增加自定义配置对象：mockId。
```javascript
axios.post('/api/query',{id:1},{mockId:1}).then(res=>{	})
axios.post('/api/query',{id:2},{mockId:2}).then(res=>{	})
```
然后，在配置对象中增加对应的mockId
```javascript
"query|cus":{
  data:{data:[{id:1,name:1}],succees:true},
  timeout:1500,
  responseType:false
},
"query|cus":{
  data:{data:[{id:2,name:2}],succees:true},
  timeout:1500,
  responseType:false
}
```
mockId会精准的对请求进行匹配，使axios对象返回其 mockId所匹配到的值。（mockId是唯一的，设置此值时，其余所有匹配规则都会失效）
```javascript
axios.post('/api/query',{id:1},{mockId:1}).then(res=>{
 console.log(res)  // {data:[{id:1,name:1}],succees:true}
})
axios.post('/api/query',{id:2},{mockId:2}).then(res=>{
 console.log(res)  // {data:[{id:2,name:2}],succees:true}
})
```
<a name="gPRlP"></a>
#### callback
对于一个代理请求，如果其入参不同时，除了使用mockId指定不同的返回值，我们也可以使用自定义calllback属性，更加灵活的获取返回值。<br />callback属性值是一个回调函数，其接受两个形参，mockData和resItem，返回处理后的值。
```javascript
"query|cus":{
  data:[{id:1,name:1},{id:2,name:2},{id:3,name:3},{id:3,name:3}],
  responseType:false,
  callback:function(mockData,resItem){
    console.log(mockData)
    console.log(resItem)
    retrun mockData
  }
}
```
mockData是自定义的返回值，上述配置中是  [{id:1,name:1},{id:2,name:2},{id:3,name:3},{id:3,name:3}],<br />resItem是一个对象，包含实际请求的url、body、method和代理对象的部分配置信息。<br />对于不同入参的请求
```javascript
axios.post('/api/query',{id:1}).then( res=>{		} )
axios.post('/api/query',{id:2}).then( res=>{		} )
```
我们可以使用如下方式返回自定义结果
```javascript
"query|cus":{
  data:{data:[{id:1,name:1},{id:2,name:2}],succees:true},
  responseType:false,
  callback:function(mockData,resItem){
      let newData = mockData.filter(res => res.id === resItem.axiosBody.id)
      retrun newData
  }
}
```
<a name="Lf5u7"></a>
### json模式
**当自定义的mock数据较多时，json模式能更快、更便捷的得到模拟返回值。**<br />options配置示例
```javascript
export default {
   "query|json":"query.json"
   "queryItemInfo|json":"queryItemInfo.json" 
}
```
使用json模式时，每一个配置项的属性值对应一个含模拟返回值的json文件名。此时我们需要在根目录创建aMock文件夹，并在里面放入用于储存模拟返回值的json文件。aMock文件内的json文件名应该与配置项的属性值一一对应。
```javascript
├─ aMock
│  ├─ config.js               //配置式代理的options配置文件
│  ├─ query.json
│  ├─ queryItemInfo.json
├─ src 
├─ public 
└─ package.json
```
> 注：配置项的属性值可以省去“.json”的文件后缀

同样的，json模式的每一个配置项也可以使用其他自定义配置，
```javascript
{
   "query|json":{timeout：1500,tip:false,JsonName:"query.json"}
   "queryItemInfo|json":{timeout：1500,tip:false,JsonName:"queryItemInfo"}
}
```
与cus模式不同的是，此时配置对象不需要提供data属性，取而代之的是一个jsonName属性，jsonName的值为对应的json文件名。axios-hook-mock会将jsonName匹配到的文件内容转化为要返回的模拟值。

<a name="iAco7"></a>
## 全局配置
默认的配置可以通过全局配置覆盖<br />参数式
```javascript
export default {
   "query|json":{timeout：1500,tip:false,JsonName:"query.json"}
   "queryItemInfo|json":{timeout：1500,tip:false,JsonName:"queryItemInfo"}
}
export const config = {
    mock:false,
    timeout:2000,
    tip:false,
    fuzzy:false,
}
 
```
配置式
```javascript
axiosMock from 'axios-hook-mock'
let options = {
   "query|json":{timeout：1500,tip:false,JsonName:"query.json"}
   "queryItemInfo|json":{timeout：1500,tip:false,JsonName:"queryItemInfo"}
}
let config = {
  mock:false,
  timeout:2000,
  tip:false,
  fuzzy:false,
}
Vue.use(axiosMock,options,config)
```
全局设置 mock 为 false，会关闭本插件的代理功能。<br />全局设置 tip 为 false，会关闭本插件的请求日志打印功能。

