import KBEDebug from "./KBEDebug";
import * as DataTypes from "./DataTypes";
import MemoryStream from "./MemoryStream";

export default class Message
{
    static messages = {};
    static clientMassges = {};

    id: number;
    name: string;
    length: number;
    argsType: number;
    args: Array<DataTypes.DATATYPE_BASE> = new Array<DataTypes.DATATYPE_BASE>();
    handler: Function = null;

    constructor(id: number, name: string, length: number, argstype: number, args: Array<number>, handler: Function)
    {
        this.id = id;
        this.name = name;
        this.length = length;
        this.argsType = argstype;

        for(let argType of args)
        {
            this.args.push(DataTypes.idToDatatype[argType]);
        }

        this.handler = handler;
    }

    private CreateFromStream(stream: MemoryStream)
    {
        if(this.args.length <= 0)
            return stream;

        let result = [];
        for(let item of this.args)
        {
            result.push(item.CreateFromStream(stream));
        }

        return result;
    }

    HandleMessage(stream: MemoryStream): void
    {
        if(this.handler === null)
        {
            KBEDebug.ERROR_MSG("KBEngine.Message::handleMessage: interface(" + this.name + "/" + this.id + ") no implement!");
            return;
        }

        if(this.args.length === 0)
        {
            if(this.argsType < 0)
            {
                this.handler(stream);
            }
            else
            {
                this.handler();
            }
        }
        else
        {
            //this.handler.apply(KBEngine.app, this.CreateFromStream(stream));
        }
    }
}