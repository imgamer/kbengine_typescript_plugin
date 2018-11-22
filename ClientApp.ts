
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
        this.InitKBEngine();
        this.InstallEvents();
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

    Login(userName?: string, password?: string, data?: Uint8Array)
    {
        if(userName && password && data)
        {
            KBEngineApp.app.Login(userName, password, data);
        }
        else
        {
            let data = KBEEncoding.StringToUTF8Array("test");
            KBEngineApp.app.Login(this.userName, this.password, data);
        }
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