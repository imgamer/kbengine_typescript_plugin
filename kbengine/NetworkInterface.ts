
import KBEDebug from "./KBEDebug";
import KBEEvent from "./Event";

export default class NetworkInterface
{
    socket: WebSocket = null;
    onOpenCB: Function = null;

    get IsGood(): boolean
    {
        return this.socket != null && this.socket.readyState === WebSocket.OPEN;
    }

    ConnectTo(addr: string, callbackFunc?: (event:Event)=>any)
    {
        try
        {
            this.socket = new WebSocket(addr);
        }
        catch(e)
        {
            KBEDebug.ERROR_MSG("KBEngineApp::Connect:Init socket error:" + e);
            KBEEvent.Fire("Event_onConnectionState", false);
            return;
        }

        this.socket.binaryType = "arraybuffer";

        this.socket.onerror = this.onerror;
        this.socket.onclose = this.onclose;
        this.socket.onmessage = this.onmessage;
        this.socket.onopen = this.onopen;
        if(callbackFunc)
        {
            this.onOpenCB = callbackFunc;
        }
    }

    Disconnect()
    {
        try
        {
            KBEDebug.INFO_MSG("NetworkInterface::Disconnect："+this.IsGood)
            if(this.socket != null)
            {
                this.socket.close();
                this.socket = null;
            }
        }
        catch(e)
        {
            KBEDebug.ERROR_MSG("NetworkInterface::Disconnect error:%s.", e);
        }
    }

    private onopen = (event: MessageEvent) =>
    {
        KBEDebug.DEBUG_MSG("KBEngineApp::onopen:success!");
        if(this.onOpenCB)
        {
            this.onOpenCB(event);
            this.onOpenCB = null;
        }
    }
    
    private onerror = () =>
    {
        KBEDebug.DEBUG_MSG("KBEngineApp::onerror:...!");
    }

    private onmessage = (event: MessageEvent) =>
    {
        let data = event.data;
        KBEDebug.DEBUG_MSG("KBEngineApp::onmessage:...!");
    }

    private onclose = () =>
    {
        KBEDebug.DEBUG_MSG("KBEngineApp::onclose:...!");
    }
}