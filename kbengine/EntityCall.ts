import NetworkInterface from "./NetworkInterface";
import Bundle from "./Bundle";
import KBEDebug from "./KBEDebug";
import Message from "./Message";

export abstract class EntityCall
{
    protected networkInterface: NetworkInterface;
    bundle: Bundle;
    id: number = 0;

    constructor(networkInterface: NetworkInterface)
    {
        this.networkInterface = networkInterface;
    }

    SendCall(bundle?: Bundle)
    {
        KBEDebug.ASSERT(this.bundle !== undefined);

        if(bundle === undefined)
            bundle = this.bundle;
        bundle.Send(this.networkInterface);
        
        if(bundle === this.bundle)
            this.bundle = undefined;
    }

    protected abstract BuildBundle();

    NewCall()
    {
        if(this.bundle === undefined)
            this.bundle = new Bundle();
            
        this.BuildBundle();

        this.bundle.WriteUint32(this.id);
    }
}

export class CellEntityCall extends EntityCall
{
    BuildBundle()
    {
        KBEDebug.ASSERT(this.bundle !== undefined);
        this.bundle.NewMessage(Message.messages["Baseapp_onRemoteCallCellMethodFromClient"])
    }
}

export class BaseEntityCall extends EntityCall
{
    BuildBundle()
    {
        KBEDebug.ASSERT(this.bundle !== undefined);
        this.bundle.NewMessage(Message.messages["Base_onRemoteMethodCall"])
    }
}
