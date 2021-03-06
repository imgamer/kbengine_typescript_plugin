
import KBEDebug from "./kbengine/KBEDebug";
import KBEEvent from "./kbengine/Event";
import * as KBEEncoding from "./kbengine/KBEEncoding";
import {KBEngineArgs, KBEngineApp} from "./kbengine/KBEngine";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ClientApp extends cc.Component 
{
    @property
    serverAddress: string = "127.0.0.1";

    @property
    port: number = 20013;

    @property
    useWss: boolean = false;

    @property
    wssBaseappPort: number = 443;

    @property
    updateTick = 100;

    @property
    isOnInitCallPropertysSetMethods = true;

    @property
    clientType = 5;

    @property
    userName = "test";

    @property
    password = "123456";

    private running = false;

    onLoad()
    {
        cc.game.addPersistRootNode(this.node);
    }

    start()
    {
        //this.Login();
    }

    run()
    {
        if(!this.running)
        {
            this.InitKBEngine();
            this.InstallEvents();
            this.running = true;
        }
    }

    InitKBEngine()
    {
        KBEDebug.INFO_MSG("ClientApp::InitKBEngine.");
        
        let args = new KBEngineArgs();
        args.address = this.serverAddress;
        args.port = this.port;
        args.updateTick = this.updateTick;
        args.isOnInitCallPropertysSetMethods = this.isOnInitCallPropertysSetMethods;
        args.clientType = this.clientType;
        args.useWss = this.useWss;
        args.wssBaseappPort = this.wssBaseappPort;

        KBEngineApp.Create(args);
    }

    Login(userName?: string, password?: string, data?: string)
    {
        if(userName && password && data)
        {
            this.userName = userName;
            this.password = password;
        }
        else
        {
            data = "test"
        }
        KBEDebug.DEBUG_MSG("ClientApp::Login:userName:%s, password:%s, loginData:%s", this.userName, this.password, data);
        let utf8data = KBEEncoding.StringToUTF8Array(data);
        KBEngineApp.app.Login(this.userName, this.password, utf8data);
    }

    InstallEvents()
    {
        KBEDebug.INFO_MSG("ClientApp::InstallEvents:start scene install event.");
        KBEEvent.Register("onConnectionState", this, this.OnConnectionState);
        // KBEEvent.Register("onLoginFailed", this, undefined);
        // KBEEvent.Register("onLoginBaseappFailed", this, undefined);
        // KBEEvent.Register("onReloginBaseappFailed", this, undefined);
        // KBEEvent.Register("onReloginBaseappSuccessfully", this, undefined);
        // KBEEvent.Register("onLoginBaseapp", this, undefined);
    }

    OnConnectionState(isConnected: boolean)
    {
        KBEDebug.DEBUG_MSG("ClientApp::OnConnectionState:%s.", isConnected);
    }

    UninstallEvents()
    {
        KBEDebug.INFO_MSG("ClientApp::UnstallEvents events.");
        KBEEvent.DeregisterObject(this);
    }
}