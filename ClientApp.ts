
import KBEDebug from "./kbengine/KBEDebug";
import KBEEvent from "./kbengine/Event";
import * as KBEEncoding from "./kbengine/KBEEncoding";
import {KBEngineArgs, KBEngineApp} from "./kbengine/KBEngine";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ClientApp extends cc.Component 
{
    @property
    IP: string = "127.0.0.1";

    @property
    port: number = 20013;

    @property
    useWss: boolean = false;

    @property
    useURL: boolean = false;

    @property
    serverURL: string = "";

    @property
    updateHZ = 100;

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
        this.InitKBEngine();
        this.InstallEvents();
    }

    start()
    {
        //this.Login();
    }

    InitKBEngine()
    {
        let args = new KBEngineArgs();
        args.ip = this.IP;
        args.port = this.port;
        args.updateHZ = this.updateHZ;
        args.isOnInitCallPropertysSetMethods = this.isOnInitCallPropertysSetMethods;
        args.clientType = this.clientType;
        args.serverURL = this.serverURL;
        args.useWss = this.useWss;
        args.useURL = this.useURL;

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
        // KBEEvent.Register("onConnectionState", this, undefined);
        // KBEEvent.Register("onLoginFailed", this, undefined);
        // KBEEvent.Register("onLoginBaseappFailed", this, undefined);
        // KBEEvent.Register("enterScene", this, undefined);
        // KBEEvent.Register("onReloginBaseappFailed", this, undefined);
        // KBEEvent.Register("onReloginBaseappSuccessfully", this, undefined);
        // KBEEvent.Register("onLoginBaseapp", this, undefined);
    }

    UninstallEvents()
    {
        KBEDebug.INFO_MSG("ClientApp::UnstallEvents events.");
        //KBEEvent.DeregisterObject(this);
    }
}