# kbengine_typescript_plugin
for kst  
用于在cocos creator平台对接kst版本kbe的typescript插件，已经实际用于微信小游戏开发并有上线项目。  
kbe服务器引擎：https://github.com/imgamer/kbengine.git，develop1.x为最新分支。  

### 使用方法说明
#### 1. 插件部署
1. 把插件代码置于项目的assets目录：`assets/kbengine_typescript_plugin`  
2. 项目代码目录为`assets/scripts`

#### 2. 定义entity  
1. 项目的 entity 定义在`assets/scripts/kbengine`目录中
2. entity需继承于`assets/kbengine_typescript_plugin/kbengine/Entity`
3. **重要：**必须在entity定义后注册脚本。例如：`Account.RegisterScript(Account.SCRIPT_NAME, Account);`请参考`assets/kbengine_typescript_plugin/entities`的范例。

#### 3. kbe插件使用
1. 在cocos creator场景创建空节点KBEMain，添加组件`assets/kbengine_typescript_plugin/ClientApp.ts`  
2. 配置KBEMain节点的kbe参数，详细参数说明请查看`ClientApp.ts`
3. `KBEMain.instance.run()`初始化kbe
4. `KBEMain.instance.Login(account, password, userData)`登录kbe服务器。  






