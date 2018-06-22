
import KBEDebug from "./KBEDebug";

export class KBEngineArgs
{
    ip: string = "127.0.0.1";
    port: number = 20013;
    updateHZ: number = 100;
    clientType: number = 5;
    isOnInitCallPropertysSetMethods: boolean = true;
}


class ServerError
{
    id: number = 0;
    name: string = "";
    description: string = "";
}


export class KBEngineApp
{
    private args: KBEngineArgs;

    private userName: string = "test";
    private password: string = "123456";
    private clientDatas: string = "";
    private encryptedKey: string = "";

	private loginappMessageImported = false;
	private baseappMessageImported = false;
	private serverErrorsDescrImported = false;
	private entitydefImported = false;

    private serverErrors: {[key: number]: ServerError} = {};

	// 登录loginapp的地址
	private ip = "";
	private port = 0;
	
	// 服务端分配的baseapp地址
	private baseappIP = "";
	private baseappPort = 0;

    private socket = null;

    private static _app: KBEngineApp = null;
    static get app()
    {
        return KBEngineApp._app;    // 如果外部使用者因为访问到null出错，表示需要先Create
    }

    static Create(args: KBEngineArgs): KBEngineApp
    {
        if(KBEngineApp._app != null)
        {
            throw Error("KBEngineApp must be singleton.");
        }
        KBEngineApp._app = new KBEngineApp(args);

        return KBEngineApp._app;
    }

    private constructor(args: KBEngineArgs)
    {
        KBEDebug.ASSERT(KBEngineApp._app === null, "KBEngineApp::constructor:singleton KBEngineApp._app must be null.");

        this.args = args;
        this.ip = args.ip;
        this.port = args.port;

        this.InstallEvents();
    }

    InstallEvents(): void
    {
        KBEDebug.DEBUG_MSG("KBEngineApp::InstallEvents");
    }

    Update(): void
    {
        KBEDebug.DEBUG_MSG("KBEngineApp::update");
    }

    Reset(): void
    {
        KBEDebug.DEBUG_MSG("KBEngineApp::Reset");
    }

    Login(userName: string, password: string, datas: string): void
    {
        this.Reset();
        this.userName = userName;
        this.password = password;
        this.clientDatas = datas;

        this.Login_loginapp(true);
    }

    private Login_loginapp(noconnect: boolean): void
    {

    }

    private Connect(addr: string): void
    {

    }

    private onopen()
    {

    }
}