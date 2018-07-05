
import KBEDebug from "./KBEDebug";
import KBEEvent from "./Event";
import NetworkInterface from "./NetworkInterface";
import Message from "./Message";
import Bundle from "./Bundle";
import MemoryStream from "./MemoryStream";
import {UTF8ArrayToString} from "./KBEEncoding";
import * as DataTypes from "./DataTypes";
import * as EntityDef from "./EntityDef";

import Entity from "./Entity";

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
    private idInterval: number;

    private userName: string = "test";
    private password: string = "123456";
    private clientDatas: string = "";
    private encryptedKey: string = "";

    private serverdatas: Uint8Array;

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

    private networkInterface: NetworkInterface = new NetworkInterface();

    private serverVersion = "";
    private serverScriptVersion = "";
    private serverProtocolMD5 = "";
    private serverEntityDefMD5 = "";
    private clientVersion = "0.9.12";
    private clientScriptVersion = "0.1.0";

    private lastTickTime: number = 0;
    private lastTickCBTime: number = 0;

    private static _app: KBEngineApp = undefined;
    static get app()
    {
        return KBEngineApp._app;    // 如果外部使用者因为访问到null出错，表示需要先Create
    }

    static Create(args: KBEngineArgs): KBEngineApp
    {
        if(KBEngineApp._app != undefined)
        {
            throw Error("KBEngineApp must be singleton.");
        }
        new KBEngineApp(args);
        return KBEngineApp._app;
    }

    Destroy()
    {
        if(this.idInterval != undefined)
        {
            clearInterval(this.idInterval);
        }

        if(KBEngineApp.app === undefined)
        {
            return;
        }       
    }

    private constructor(args: KBEngineArgs)
    {
        KBEDebug.ASSERT(KBEngineApp._app === undefined, "KBEngineApp::constructor:singleton KBEngineApp._app must be undefined.");
        KBEngineApp._app = this;

        this.args = args;
        this.ip = args.ip;
        this.port = args.port;

        this.InstallEvents();

        Message.BindFixedMessage();
        DataTypes.InitDatatypeMapping();

        this.idInterval = setInterval(this.Update.bind(this), this.args.updateHZ);
    }

    InstallEvents(): void
    {
        KBEDebug.DEBUG_MSG("KBEngineApp::InstallEvents");
    }

    Update(): void
    {
        KBEngineApp.app.SendTick();
    }

    private SendTick()
    {
        if(!this.networkInterface.IsGood)
        {
            KBEDebug.DEBUG_MSG("KBEngineApp::SendTick...this.networkInterface.IsGood noooooooooo.");
            return;
        }
        
        let now = (new Date()).getTime();
        //KBEDebug.DEBUG_MSG("KBEngineApp::SendTick...now(%d), this.lastTickTime(%d), this.lastTickCBTime(%d).", now, this.lastTickTime, this.lastTickCBTime);
        if((now - this.lastTickTime) / 1000 > 15)
        {
            if(this.lastTickCBTime < this.lastTickTime)
            {
                KBEDebug.ERROR_MSG("KBEngineApp::Update: Receive appTick timeout!");
                this.networkInterface.Disconnect();
                return;
            }

            let bundle = new Bundle();
            if(this.currserver === "loginapp")
            {
                bundle.NewMessage(Message.messages["Loginapp_onClientActiveTick"]);
            }
            else
            {
                bundle.NewMessage(Message.messages["Baseapp_onClientActiveTick"]);
            }
            bundle.Send(this.networkInterface);

            this.lastTickTime = now;
        }

        this.UpdatePlayerToServer();
    }

    Reset(): void
    {
        KBEDebug.DEBUG_MSG("KBEngineApp::Reset");
        this.networkInterface.Disconnect();

        DataTypes.Reset();
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
            let bundle = new Bundle();
            bundle.NewMessage(Message.messages["Loginapp_login"]);
            bundle.WriteInt8(this.args.clientType);
            bundle.WriteBlob(this.clientDatas);
            bundle.WriteString(this.userName);
            bundle.WriteString(this.password);
            bundle.Send(this.networkInterface);
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

        this.lastTickCBTime = (new Date()).getTime();
    }

    Client_onImportClientMessages(stream: MemoryStream)
    {
        this.OnImportClientMessages(stream);
    }

    private OnImportClientMessages(stream: MemoryStream): void
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
                this.Login_loginapp(false);
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
            if(!this.entitydefImported)
            {
                KBEDebug.INFO_MSG("KBEngineApp::onImportClientMessagesCompleted: start importEntityDef ...");
                let bundle = new Bundle();
                bundle.NewMessage(Message.messages["Baseapp_importClientEntityDef"]);
                bundle.Send(this.networkInterface);
            }
            else
            {
                this.onImportEntityDefCompleted();
            }
        }
    }

    private onImportEntityDefCompleted()
    {
        KBEDebug.INFO_MSG("KBEngineApp::onImportEntityDefCompleted: successfully!");
        this.entitydefImported = true;
        this.Login_baseapp(false);
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

    private Hello()
    {
        KBEDebug.INFO_MSG("KBEngine::Hello.........current server:%s.", this.currserver);
        let bundle: Bundle = new Bundle();
        if(this.currserver === "loginapp")
        {
            bundle.NewMessage(Message.messages["Loginapp_hello"]);
        }
        else
        {
            bundle.NewMessage(Message.messages["Baseapp_hello"]);
        }

        bundle.WriteString(this.clientVersion);
        bundle.WriteString(this.clientScriptVersion);
        bundle.WriteBlob(this.encryptedKey);
        bundle.Send(this.networkInterface);
    }

    Client_onHelloCB(stream: MemoryStream)
    {
        KBEDebug.INFO_MSG("KBEngine::Client_onHelloCB.........stream length:%d.", stream.Length());
        this.serverVersion = stream.ReadString();
        this.serverScriptVersion = stream.ReadString();
        this.serverProtocolMD5 = stream.ReadString();
        this.serverEntityDefMD5 = stream.ReadString();
        let ctype = stream.ReadInt32();

        KBEDebug.INFO_MSG("KBEngineApp::Client_onHelloCB: verInfo(" + this.serverVersion + "), scriptVerInfo(" + 
        this.serverScriptVersion + "), serverProtocolMD5(" + this.serverProtocolMD5 + "), serverEntityDefMD5(" + 
        this.serverEntityDefMD5 + "), ctype(" + ctype + ")!");

        this.lastTickCBTime = (new Date()).getTime();
    }

    Client_onVersionNotMatch(stream: MemoryStream)
	{
        KBEDebug.DEBUG_MSG("KBEngine::Client_onVersionNotMatch.........stream length:%d.", stream.Length());
		this.serverVersion = stream.ReadString();
		KBEDebug.ERROR_MSG("Client_onVersionNotMatch: verInfo=" + this.clientVersion + " not match(server: " + this.serverVersion + ")");
		KBEEvent.Fire("onVersionNotMatch", this.clientVersion, this.serverVersion);
    }
    
	Client_onAppActiveTickCB()
	{
		let dateObject = new Date();
        this.lastTickCBTime = dateObject.getTime();
        KBEDebug.DEBUG_MSG("KBEngine::Client_onAppActiveTickCB.........lastTickCBTime:%d.", this.lastTickCBTime);
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

    GetServerError(id: number): string
    {
        let error: ServerError = this.serverErrors[id];
        if(error == undefined)
        {
            return "";
        }

        return error.name + "[" + error.description + "]";
    }

    private UpdatePlayerToServer()
    {
        //KBEDebug.DEBUG_MSG("KBEngine::UpdatePlayerToServer.........");
    }

    Client_onLoginFailed(stream: MemoryStream)
	{
		var failedcode = stream.ReadUint16();
		this.serverdatas = stream.ReadBlob();
		KBEDebug.ERROR_MSG("KBEngineApp::Client_onLoginFailed: failedcode(" + this.serverErrors[failedcode].name + "), datas(" + this.serverdatas.length + ")!");
		KBEEvent.Fire("onLoginFailed", failedcode);
    }
    
    Client_onLoginSuccessfully(stream: MemoryStream)
	{
        KBEDebug.DEBUG_MSG("Client_onLoginSuccessfully------------------->>>");
		var accountName = stream.ReadString();
		this.userName = accountName;
		this.baseappIP = stream.ReadString();
		this.baseappPort = stream.ReadUint16();
		this.serverdatas = stream.ReadBlob();
		
		KBEDebug.INFO_MSG("KBEngineApp::Client_onLoginSuccessfully: accountName(" + accountName + "), addr(" + 
        this.baseappIP + ":" + this.baseappPort + "), datas(" + this.serverdatas.length + ")!");
		
		this.networkInterface.Disconnect();
		this.Login_baseapp(true);
    }
    
    private Login_baseapp(noconnect: boolean)
    {
        if(noconnect)
        {
            let addr: string = "ws://" + this.baseappIP + ":" + this.baseappPort;
            KBEDebug.INFO_MSG("KBEngineApp::Login_baseapp: start connect to " + addr + "!");
            
            this.networkInterface.ConnectTo(addr, (event: MessageEvent) => this.OnOpenBaseapp(event));
        }
        else
        {
            let bundle = new Bundle();
            bundle.NewMessage(Message.messages["Baseapp_loginBaseapp"]);
            bundle.WriteString(this.userName);
            bundle.WriteString(this.password);
            bundle.Send(this.networkInterface);
        }
    }

    private OnOpenBaseapp(event: MessageEvent)
    {
        KBEDebug.INFO_MSG("KBEngineApp::onOpenBaseapp: successfully!");
        this.currserver = "baseapp";
        
        if(!this.baseappMessageImported)
        {
            let bundle = new Bundle();
            bundle.NewMessage(Message.messages["Baseapp_importClientMessages"]);
            bundle.Send(this.networkInterface);
            KBEEvent.Fire("Baseapp_importClientMessages");
        }
        else
        {
            this.onImportClientMessagesCompleted();
        }
    }

    Client_onImportClientEntityDef(stream: MemoryStream)
    {
        this.OnImportClientEntityDef(stream);
    }

    async OnImportClientEntityDef(stream: MemoryStream)
    {
        this.CreateAllDataTypeFromStream(stream);
        
        while(!stream.ReadEOF())
        {
            let scriptmodule_name = stream.ReadString();
			let scriptUtype = stream.ReadUint16();
			let propertysize = stream.ReadUint16();
			let methodsize = stream.ReadUint16();
			let base_methodsize = stream.ReadUint16();
			let cell_methodsize = stream.ReadUint16();
			
			KBEDebug.INFO_MSG("KBEngineApp::OnImportClientEntityDef: import(" + scriptmodule_name + "), propertys(" + propertysize + "), " +
                    "clientMethods(" + methodsize + "), baseMethods(" + base_methodsize + "), cellMethods(" + cell_methodsize + ")!");

            let module:EntityDef.ScriptModule = new EntityDef.ScriptModule(scriptmodule_name);
            if(module.script === undefined)
                KBEDebug.ERROR_MSG("KBEngineApp::OnImportClientEntityDef: module(" + scriptmodule_name + ") not found!");

            EntityDef.MODULE_DEFS[scriptmodule_name] = module;
            EntityDef.MODULE_DEFS[scriptUtype] = module;

            if (propertysize > 255)
                 module.usePropertyDescrAlias = false;
            else
                 module.usePropertyDescrAlias = true;

            while(propertysize > 0)
            {
                propertysize--;

                let propertyUtype = stream.ReadUint16();
                let propertyFlags = stream.ReadUint32();
                let aliasID = stream.ReadInt16();
                let name = stream.ReadString();
                let defaultValStr = stream.ReadString();
                let utype = DataTypes.datatypes[stream.ReadUint16()];

                let setHandler: Function = undefined;
                if(module.script !== undefined)
                {
                    setHandler = module["set_"+name];
                }

                let property: EntityDef.Property = new EntityDef.Property();
                property.name = name;
                property.utype = utype;
                property.properUtype = propertyUtype;
                property.flags = propertyFlags;
                property.aliasID = aliasID;
                property.defaultValStr = defaultValStr;
                property.setHandler = setHandler;
                property.value = property.utype.ParseDefaultValueString(defaultValStr);

                KBEDebug.DEBUG_MSG("KBEngineApp::OnImportClientEntityDef:import property: name(%s), propertyUtype(%d), flags(%d), aliasID(%d), defaultValStr(%s), defaultVal(%s), utype(%d).",
                                     name, propertyUtype, propertyFlags, aliasID, defaultValStr, property.value, utype);
                
                module.propertys[name] = property;
                if(module.usePropertyDescrAlias)
                    module.propertys[aliasID] = property;
                else
                    module.propertys[propertyUtype] = property;
            }

            if(methodsize > 255)
                module.useMethodDescrAlias = true;
            else
                module.useMethodDescrAlias = false;

            while(methodsize > 0)
            {
                methodsize--;

                let methodUtype = stream.ReadUint16();
                let aliasID = stream.ReadInt16();
                let name = stream.ReadString();
                let argssize = stream.ReadUint8();
                let args: Array<DataTypes.DATATYPE_BASE> = new Array<DataTypes.DATATYPE_BASE>();

                KBEDebug.DEBUG_MSG("KBEngineApp::OnImportClientEntityDef:import method:%s, args(%d).", name, argssize);
                while(argssize > 0)
                {
                    argssize--;
                    let utype = stream.ReadUint16();
                    args.push(DataTypes.datatypes[utype])
                }

                let method: EntityDef.Method = new EntityDef.Method();
                method.name = name;
                method.methodUtype = methodUtype;
                method.aliasID = aliasID;
                method.args = args;

                if(module.script !== undefined)
                {
                    method.handler = module.script[name];
                    if(method.handler === undefined)
                    {
                        KBEDebug.ERROR_MSG("KBEngineApp::OnImportClientEntityDef:can not find def method:%s.", name);
                    }
                }

                module.methods[name] = method;
                if(module.useMethodDescrAlias)
                    module.methods[aliasID] = method;
                else
                    module.methods[methodUtype] = method;
            }

            while(base_methodsize > 0)
            {
                base_methodsize--;

                let methodUtype = stream.ReadUint16();
                let aliasID = stream.ReadInt16();
                let name = stream.ReadString();
                let argssize = stream.ReadUint8();
                let args: Array<DataTypes.DATATYPE_BASE> = new Array<DataTypes.DATATYPE_BASE>();

                KBEDebug.DEBUG_MSG("KBEngineApp::OnImportClientEntityDef:import base method:%s, args(%d).", name, argssize);
                while(argssize > 0)
                {
                    argssize--;
                    let utype = stream.ReadUint16();
                    args.push(DataTypes.datatypes[utype])
                }

                let method: EntityDef.Method = new EntityDef.Method();
                method.name = name;
                method.methodUtype = methodUtype;
                method.aliasID = aliasID;
                method.args = args;

                module.baseMethods[name] = method;
                module.baseMethods[methodUtype] = method;
            }

            while(cell_methodsize > 0)
            {
                
                cell_methodsize--;

                let methodUtype = stream.ReadUint16();
                let aliasID = stream.ReadInt16();
                let name = stream.ReadString();
                let argssize = stream.ReadUint8();
                let args: Array<DataTypes.DATATYPE_BASE> = new Array<DataTypes.DATATYPE_BASE>();

                KBEDebug.DEBUG_MSG("KBEngineApp::OnImportClientEntityDef:import cell method:%s, args(%d).", name, argssize);

                while(argssize > 0)
                {
                    argssize--;
                    let utype = stream.ReadUint16();
                    args.push(DataTypes.datatypes[utype])
                }

                let method: EntityDef.Method = new EntityDef.Method();
                method.name = name;
                method.methodUtype = methodUtype;
                method.aliasID = aliasID;
                method.args = args;

                module.cellMethods[name] = method;
                module.cellMethods[methodUtype] = method;
            }

            for(let name in module.methods)
            {
                if(module.script !== undefined && module.script[name] === undefined)
                {
                    KBEDebug.WARNING_MSG("Entity def %s::mehod(%s) no implement!", scriptmodule_name, name);
                }
            }
        }

        this.onImportEntityDefCompleted();
    }

    private CreateAllDataTypeFromStream(stream: MemoryStream)
    {
        let aliasSize = stream.ReadUint16();
        KBEDebug.INFO_MSG("KBEngineApp::createDataTypeFromStreams: importAlias(size=" + aliasSize + ")!");

        while(aliasSize-- > 0)
        {
            this.CreateDataTypeFromStream(stream);
        }

        for(let dataType in DataTypes.datatypes)
        {
            if(DataTypes.datatypes[dataType] != undefined)
            {
                DataTypes.datatypes[dataType].Bind();
            }
        }
    }

    private CreateDataTypeFromStream(stream: MemoryStream)
    {
        //KBEDebug.DEBUG_MSG("CreateDataTypeFromStream------------------->>>");
        let utype = stream.ReadUint16();
        let name = stream.ReadString();
        let valname = stream.ReadString();
        if(valname.length === 0)
        {
            valname = "Null_" + utype;
        }
        KBEDebug.INFO_MSG("KBEngineApp::CreateDataTypeFromStream: importAlias(" + utype + ":" + name + ":" + valname + ")!");

        if(name === "FIXED_DICT")
        {
            let datatype = new DataTypes.DATATYPE_FIXED_DICT();
            let keysize = stream.ReadUint8();
            datatype.implementedBy = stream.ReadString();

            while(keysize-- > 0)
            {
                let keyname = stream.ReadString();
                let keyutype = stream.ReadUint16();
                //KBEDebug.DEBUG_MSG("CreateDataTypeFromStream------------------->>>FIXED_DICT(valname:%s):keyutype:%d, keyname:%s", valname, keyutype, keyname);
                datatype.dictType[keyname] = keyutype;
            }
            
            DataTypes.datatypes[valname] = datatype;
        }
        else if(name === "ARRAY")
        {
            let itemutype = stream.ReadUint16();
            let datatype = new DataTypes.DATATYPE_ARRAY();
            datatype.type = itemutype;
            DataTypes.datatypes[valname] = datatype;

            //KBEDebug.DEBUG_MSG("CreateDataTypeFromStream------------------->>>ARRAY(valname:%s), itemutype:%d.", valname, itemutype);
        }
        else
        {
            DataTypes.datatypes[valname] = DataTypes.datatypes[name];
        }

        DataTypes.datatypes[utype] = DataTypes.datatypes[valname];
    }
}