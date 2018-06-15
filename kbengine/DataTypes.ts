
import MemoryStream from "./MemoryStream";
import { UINT64, INT64 } from "./Number64Bits";
import * as KBEMath from "./KBEMath";
import * as KBEEncoding from "./KBEEncoding";

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

export class DATATYPE_UINT16 extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadUint16();
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        return stream.WriteUint16(value);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {
        if(!IsNumber(value))
            return false;
        
        if(value < 0 || value > 0xffff)
        {
            return false;
        }
        
        return true;
    }
}

export class DATATYPE_UINT32 extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadUint32();
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        return stream.WriteUint32(value);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {
        if(!IsNumber(value))
            return false;
        
        if(value < 0 || value > 0xffffffff)
        {
            return false;
        }
        
        return true;
    }
}

export class DATATYPE_UINT64 extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadUint64();
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        return stream.WriteUint64(value);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {
        return value instanceof UINT64;
    }
}

export class DATATYPE_INT8 extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadInt8();
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        return stream.WriteInt8(value);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {
        if(!IsNumber(value))
            return false;
        
        if(value < -0x80 || value > 0x7f)
        {
            return false;
        }
        
        return true;
    }
}

export class DATATYPE_INT16 extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadInt16();
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        return stream.WriteInt16(value);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {
        if(!IsNumber(value))
            return false;
        
        if(value < -0x8000 || value > 0x7fff)
        {
            return false;
        }
        
        return true;
    }
}

export class DATATYPE_INT32 extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadInt32();
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        return stream.WriteInt32(value);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {
        if(!IsNumber(value))
            return false;
        
        if(value < -0x80000000 || value > 0x7fffffff)
        {
            return false;
        }
        
        return true;
    }
}

export class DATATYPE_INT64 extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadInt64();
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        return stream.WriteInt64(value);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {    
        return value instanceof INT64;
    }
}

export class DATATYPE_FLOAT extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadFloat();
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        return stream.WriteFloat(value);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {    
        return typeof(value) === "number";
    }
}

export class DATATYPE_DOUBLE extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadDouble();
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        return stream.WriteDouble(value);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {    
        return typeof(value) === "number";
    }
}

export class DATATYPE_STRING extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadString();
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        return stream.WriteString(value);
    }

    ParseDefaultValueString(value: string): any
    {
        return value;   // TODO: 需要测试正确
    }

    IsSameType(value: any): boolean
    {    
        return typeof(value) === "string";
    }
}

export class DATATYPE_VECTOR2 extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return new KBEMath.Vector2(stream.ReadFloat(), stream.ReadFloat());
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        stream.WriteFloat(value.x);
        stream.WriteFloat(value.y);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {    
        return value instanceof KBEMath.Vector2;
    }
}

export class DATATYPE_VECTOR3 extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return new KBEMath.Vector3(stream.ReadFloat(), stream.ReadFloat(), stream.ReadFloat());
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        stream.WriteFloat(value.x);
        stream.WriteFloat(value.y);
        stream.WriteFloat(value.z);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {    
        return value instanceof KBEMath.Vector3;
    }
}

export class DATATYPE_PYTHON extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadBlob();
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        stream.WriteBlob(value);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {    
        return value instanceof Uint8Array;
    }
}

export class DATATYPE_UNICODE extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return KBEEncoding.UTF8ArrayToString(stream.ReadBlob());
    }

    AddToStream(stream: MemoryStream, value: any): void
    {
        stream.WriteBlob(KBEEncoding.StringToUTF8Array(value));
    }

    ParseDefaultValueString(value: string): any
    {
        return value;
    }

    IsSameType(value: any): boolean
    {    
        return typeof value === "string";
    }
}