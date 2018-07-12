
import KBEDebug from "./KBEDebug";
import KBEEvent from "./Event";
import MemoryStream from "./MemoryStream";
import Message from "./Message";

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
            KBEDebug.ERROR_MSG("NetworkInterface::Connect:Init socket error:" + e);
            KBEEvent.Fire("onConnectionState", false);
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

    Close()
    {
        try
        {
            KBEDebug.INFO_MSG("NetworkInterface::Close"+this.IsGood)
            if(this.socket != null)
            {
                this.socket.close();
                this.socket.onclose = undefined;
                this.socket = null;
            }
        }
        catch(e)
        {
            KBEDebug.ERROR_MSG("NetworkInterface::Close error:%s.", e);
        }
    }

    Send(buffer: ArrayBuffer)
    {
        if(!this.IsGood)
        {
            KBEDebug.ERROR_MSG("NetworkInterface::Send:socket is unavailable.");
            return;
        }

        try
        {
            KBEDebug.DEBUG_MSG("NetworkInterface::Send buffer length:[%d].", buffer.byteLength);
            this.socket.send(buffer);
        }
        catch(e)
        {
            KBEDebug.ERROR_MSG("NetworkInterface::Send error:%s.", e);
        }
    }

    private onopen = (event: MessageEvent) =>
    {
        KBEDebug.DEBUG_MSG("NetworkInterface::onopen:success!");
        if(this.onOpenCB)
        {
            this.onOpenCB(event);
            this.onOpenCB = null;
        }
    }
    
    private onerror = (event: MessageEvent) =>
    {
        KBEDebug.DEBUG_MSG("NetworkInterface::onerror:...!");
        KBEEvent.Fire("onNetworkError", event);
    }

    private onmessage = (event: MessageEvent) =>
    {
        let data: ArrayBuffer = event.data;
        KBEDebug.DEBUG_MSG("NetworkInterface::onmessage:...!" + data.byteLength);
        let stream: MemoryStream = new MemoryStream(data);
        stream.wpos = data.byteLength;

        while(stream.rpos < stream.wpos)
        {
            let msgID = stream.ReadUint16();
            KBEDebug.DEBUG_MSG("NetworkInterface::onmessage:...!msgID:" + msgID);

            let handler: Message = Message.clientMassges[msgID];
            if(!handler)
            {
                KBEDebug.ERROR_MSG("NetworkInterface::onmessage:message(%d) has not found.", msgID);
            }
            else
            {
                let msgLen = handler.length;
                if(msgLen === -1)
                {
                    msgLen = stream.ReadUint16();
                    if(msgLen === 65535)
                    {
                        msgLen = stream.ReadUint32();
                    }
                }

                let wpos = stream.wpos;
                let rpos = stream.rpos + msgLen;
                stream.wpos = rpos;
                handler.HandleMessage(stream);
                stream.wpos = wpos;
                stream.rpos = rpos;
            }
        }
    }

    private onclose = () =>
    {
        KBEDebug.DEBUG_MSG("NetworkInterface::onclose:...!");
        KBEEvent.Fire("onDisconnected");
    }
}