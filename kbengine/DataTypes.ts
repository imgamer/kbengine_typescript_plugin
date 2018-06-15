
import MemoryStream from "./MemoryStream";

function IsNumber(anyObject: any): boolean
{
    return typeof anyObject === "number";
}

export abstract class DATATYPE_BASE
{
    static readonly FLOATE_MAX = Number.MAX_VALUE;

    bind(): void
    {}

    abstract CreateFromStream(stream: MemoryStream): any;
    abstract AddToStream(stream: MemoryStream, value: any): void;
    abstract ParseDefaultValueString(value: string): any;
    abstract IsSameType(value: any): boolean;
}

export class DATATYPE_UINT8 extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadUint8();
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        return stream.WriteUint8(value);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {
        if(!IsNumber(value))
            return false;
        
        if(value < 0 || value > 0xff)
        {
            return false;
        }
        
        return true;
    }
}