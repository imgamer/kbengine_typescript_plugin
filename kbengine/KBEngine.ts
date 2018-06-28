
import KBEDebug from "./KBEDebug";
import KBEEvent from "./Event";
import NetworkInterface from "./NetworkInterface";
import Message from "./Message";
import Bundle from "./Bundle";
import MemoryStream from "./MemoryStream";
import {UTF8ArrayToString} from "./KBEEncoding";

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

    private currserver = "loginapp";
    private currstate = "create";

    private serverErrs: {[key:number]: ServerError} = {};

    private networkInterface: NetworkInterface = new NetworkInterface();

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
        new KBEngineApp(args);
        return KBEngineApp._app;
    }

    private constructor(args: KBEngineArgs)
    {
        KBEDebug.ASSERT(KBEngineApp._app === null, "KBEngineApp::constructor:singleton KBEngineApp._app must be null.");
        KBEngineApp._app = this;

        this.args = args;
        this.ip = args.ip;
        this.port = args.port;

        this.InstallEvents();

        Message.BindFixedMessage();
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
        this.networkInterface.Disconnect();
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
        if(noconnect)
        {
            let addr: string = "ws://" + this.ip +":" + this.port;
            KBEDebug.INFO_MSG("KBEngineApp::Login_loginapp: start connect to " + addr + "!");
            
            this.networkInterface.ConnectTo(addr, (event: MessageEvent) => this.OnOpenLoginapp_login(event));
        }
        else
        {

        }
    }

    private OnOpenLoginapp_login(event: MessageEvent) 
    {
        KBEDebug.DEBUG_MSG("KBEngineApp::onOpenLoginapp_login:success to %s.", this.ip);
        if(!this.networkInterface.IsGood)   // 有可能在连接过程中被关闭
        {
            KBEDebug.WARNING_MSG("KBEngineApp::onOpenLoginapp_login:network has been closed in connecting!");
            return;
        }

        this.currserver = "loginapp";
        this.currstate = "login";

        KBEEvent.Fire("Event_onConnectionState", true);

        if(!this.loginappMessageImported)
        {
            let bundle = new Bundle();
            bundle.NewMessage(Message.messages["Loginapp_importClientMessages"]);
            bundle.Send(this.networkInterface);
        }
    }

    Client_onImportClientMessages(stream: MemoryStream)
    {
        this.OnImportClientMessages(stream);
    }

    OnImportClientMessages(stream: MemoryStream): void
    {
        let msgcount = stream.ReadUint16();
        KBEDebug.DEBUG_MSG("KBEngineApp::OnImportClientMessages:import............stream len(%d), msgcount(%d).", stream.Length(), msgcount);

        while(msgcount > 0)
        {
            msgcount--;

            let msgid = stream.ReadUint16();
            let msglen = stream.ReadInt16();
            let msgname = stream.ReadString();
            let argtype = stream.ReadInt8();
            let argsize  = stream.ReadUint8();
            let argstypes = new Array<number>(argsize);
            for(let i = 0; i < argsize; i++)
            {
                argstypes[i] = stream.ReadUint8();
            }

            let handler: Function = undefined;
            let isClientMessage: boolean = this.IsClientMessage(msgname);
            if(isClientMessage)
            {
                handler = this.GetFunction(msgname);
                if(handler === undefined)
                {
                    KBEDebug.ERROR_MSG("KBEngineApp::onImportClientMessages[" + KBEngineApp.app.currserver + "]: interface(" + msgname + "/" + msgid + ") no implement!");
                }
            }

            let msg: Message = new Message(msgid, msgname, msglen, argtype, argstypes, handler);
            if(msgname.length > 0)
            {
                Message.messages[msgname] = msg;
                if(isClientMessage)
                {
                    Message.clientMassges[msgid] = msg;
                }
            }
            else
            {
                Message[this.currserver][msgid] = msg;
            }

            KBEDebug.DEBUG_MSG("KBEngineApp::OnImportClientMessages:import............msgid(%d), msglen(%d), msgname(%s), argtype(%d), argsize(%d).", msgid, msglen, msgname, argtype, argsize);
        }

        this.onImportClientMessagesCompleted();
    }

    private onImportClientMessagesCompleted()
    {
        KBEDebug.INFO_MSG("KBEngineApp::onImportClientMessagesCompleted:successfully......currserver(%s) currstate(%s).", this.currserver, this.currstate);
        this.Hello();

        if(this.currserver === "loginapp")
        {
            this.loginappMessageImported = true;
            if(!this.serverErrorsDescrImported)
            {
                this.serverErrorsDescrImported = true;
                KBEDebug.INFO_MSG("KBEngine::onImportClientMessagesCompleted(): send importServerErrorsDescr!");
                let bundle: Bundle = new Bundle();
                bundle.NewMessage(Message.messages["Loginapp_importServerErrorsDescr"]);
                bundle.Send(this.networkInterface);
            }

            if(this.currstate === "login")
            {
                //this.Login_loginapp(false);
            }
            else if(this.currstate == "resetpassword")
            {
            }
            else    // createAccount
            {
            }
        }
        else
        {
            this.baseappMessageImported = true;
        }
    }

    private IsClientMessage(name: string): boolean
    {
        return name.indexOf("Client_") >= 0;
    }

    private GetFunction(name: string): Function
    {
        let func: Function = this[name];
        if(!(func instanceof Function))
        {
            func = undefined;
        }
        return func;
    }

    Hello()
    {
        KBEDebug.INFO_MSG("KBEngine::Hello.........");
    }

    Client_onImportServerErrorsDescr(stream: MemoryStream)
    {
        let size: number = stream.ReadUint16();

        while(size > 0)
        {
            size--;
            let error = new ServerError();
            error.id = stream.ReadUint16()
            error.name = UTF8ArrayToString(stream.ReadBlob());
            error.description = UTF8ArrayToString(stream.ReadBlob());

            this.serverErrors[error.id] = error;

            KBEDebug.INFO_MSG("Client_onImportServerErrorsDescr: id=" + error.id + ", name=" + error.name + ", descr=" + error.description);
        }
    }
}