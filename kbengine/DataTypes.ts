
import MemoryStream from "./MemoryStream";
import Bundle from "./Bundle";
import * as KBEMath from "./KBEMath";
import * as KBEEncoding from "./KBEEncoding";


export class INT64
{
    low: number;
    high: number;
    sign: number = 1;

    constructor(p_low: number, p_high: number)
    {
        this.low = p_low;
        this.high = p_high;
        
        if(p_high >= 2147483648)
        {
            this.sign = -1;
            this.low = (4294967296 - this.low) & 0xffffffff;
            if(p_low > 0)
            {
                this.high = 4294967295 - this.high;
            }
            else
            {
                this.high = 4294967296 - this.high;
            }
        }
    }

    toString()
    {
		let result: string = "";
		
		if(this.sign < 0)
		{
			result += "-"
		}
		
		let low = this.low.toString(16);
		let high = this.high.toString(16);
		
		if(this.high > 0)
		{
			result += high;
			for(let i = 8 - low.length; i > 0; --i)
			{
				result += "0";
			}
		}
		
		return result + low;
    }
}

export class UINT64
{
    low: number;
    high: number;

    constructor(p_low: number, p_high: number)
    {
        this.low = p_low;
        this.high = p_high;
    }

    toString()
    {
		let low = this.low.toString(16);
		let high = this.high.toString(16);
		
		let result = "";
		if(this.high > 0)
		{
			result += high;
			for(let i = 8 - low.length; i > 0; --i)
			{
				result += "0";
			}
		}

		return result + low;
    }
}

export function BuildINT64(data: number): INT64
{
    let low = data & 0xffff;

    // js不支持32位移位操作，分2次右移
    let high = data >> 16;
    high = (high >> 16) & 0xffff;

    return new INT64(low, high);
}

export function BuildUINT64(data: number): UINT64
{
    let low = data & 0xffff;

    // js不支持32位移位操作，分2次右移
    let high = data >> 16;
    high = (high >> 16) & 0xffff;

    return new UINT64(low, high);
}

function IsNumber(anyObject: any): boolean
{
    return typeof anyObject === "number";
}

export abstract class DATATYPE_BASE
{
    static readonly FLOATE_MAX = Number.MAX_VALUE;

    Bind(): void
    {}

    abstract CreateFromStream(stream: MemoryStream): any;
    abstract AddToStream(stream: Bundle, value: any): void;
    abstract ParseDefaultValueString(value: string): any;
    abstract IsSameType(value: any): boolean;
}

export class DATATYPE_UINT8 extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadUint8();
    }

    AddToStream(stream: Bundle, value: any): void
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

    AddToStream(stream: Bundle, value: any): void
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

    AddToStream(stream: Bundle, value: any): void
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

    AddToStream(stream: Bundle, value: any): void
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

    AddToStream(stream: Bundle, value: any): void
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

    AddToStream(stream: Bundle, value: any): void
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

    AddToStream(stream: Bundle, value: any): void
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

    AddToStream(stream: Bundle, value: any): void
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

    AddToStream(stream: Bundle, value: any): void
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

    AddToStream(stream: Bundle, value: any): void
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

    AddToStream(stream: Bundle, value: any): void
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

    AddToStream(stream: Bundle, value: any): void
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

    AddToStream(stream: Bundle, value: any): void
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

export class DATATYPE_VECTOR4 extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return new KBEMath.Vector4(stream.ReadFloat(), stream.ReadFloat(), stream.ReadFloat(), stream.ReadFloat());
    }

    AddToStream(stream: Bundle, value: any): void
    {
        stream.WriteFloat(value.x);
        stream.WriteFloat(value.y);
        stream.WriteFloat(value.z);
        stream.WriteFloat(value.w);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {    
        return value instanceof KBEMath.Vector4;
    }
}


export class DATATYPE_PYTHON extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadBlob();
    }

    AddToStream(stream: Bundle, value: any): void
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

    AddToStream(stream: Bundle, value: any): void
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

export class DATATYPE_MAILBOX extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
    }

    AddToStream(stream: Bundle, value: any): void
    {
        stream.WriteBlob(value);
    }

    ParseDefaultValueString(value: string): any
    {
    }

    IsSameType(value: any): boolean
    {    
        return false;
    }
}

export class DATATYPE_BLOB extends DATATYPE_BASE
{
    CreateFromStream(stream: MemoryStream): any
    {
        return stream.ReadBlob();
    }

    AddToStream(stream: Bundle, value: any): void
    {
        stream.WriteBlob(value);
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {
        return true;
    }
}

export class DATATYPE_ARRAY extends DATATYPE_BASE
{
    type: any;
    
    Bind()
    {
        if(typeof(this.type) == "number")
            this.type = datatypes[this.type];
    }

    CreateFromStream(stream: MemoryStream): Array<any>
    {
        let size = stream.ReadUint32();
        let items = [];
        while(size-- > 0)
        {
            items.push(this.type.CreateFromStream(stream));
        }
        
        return items;
    }

    AddToStream(stream: Bundle, value: any): void
    {
        stream.WriteUint32(value.length);
        for(let i = 0; i < value.length; i++)
        {
            this.type.AddToStream(stream, value[i]);
        }
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {
        for(let i = 0; i < value.length; i++)
        {
            if(!this.type.IsSameType(value[i]))
                return false;
        }

        return true;
    }
}

export class DATATYPE_FIXED_DICT extends DATATYPE_BASE
{
    dictType: {[key: string]: any} = {};
    implementedBy: string;

    Bind()
    {
        for(let key in this.dictType)
        {
            if(typeof(this.dictType[key]) == "number")
            {
                this.dictType[key] = datatypes[key];
            }
        }
    }

    CreateFromStream(stream: MemoryStream): {[key: string]: any}
    {
        let datas = {};
        for(let key in this.dictType)
        {
            datas[key] = this.dictType[key].CreateFromStream(stream);
        }

        return datas;
    }

    AddToStream(stream: Bundle, value: any): void
    {
        for(let key in this.dictType)
        {
            this.dictType[key].AddToStream(stream, value[key]);
        }
    }

    ParseDefaultValueString(value: string): any
    {
        return eval(value);
    }

    IsSameType(value: any): boolean
    {
        for(let key in this.dictType)
        {
            if(!this.dictType[key].IsSameType(value[key]))
                return false;
        }
        return true;
    }
}


export var datatypes = {};
export var idToDatatype: {[key: number]: DATATYPE_BASE} = {};

export function InitDatatypeMapping()
{
    datatypes["UINT8"] = new DATATYPE_UINT8();
    datatypes["UINT16"] = new DATATYPE_UINT16();
    datatypes["UINT32"] = new DATATYPE_UINT32();
    datatypes["UINT64"] = new DATATYPE_UINT64();
    
    datatypes["INT8"] = new DATATYPE_INT8();
    datatypes["INT16"] = new DATATYPE_INT16();
    datatypes["INT32"] = new DATATYPE_INT32();
    datatypes["INT64"] = new DATATYPE_INT64();
    
    datatypes["FLOAT"] = new DATATYPE_FLOAT();
    datatypes["DOUBLE"] = new DATATYPE_DOUBLE();
    
    datatypes["STRING"] = new DATATYPE_STRING();
    datatypes["VECTOR2"] = new DATATYPE_VECTOR2();
    datatypes["VECTOR3"] = new DATATYPE_VECTOR3();
    datatypes["VECTOR4"] = new DATATYPE_VECTOR4();
    datatypes["PYTHON"] = new DATATYPE_PYTHON();
    datatypes["UNICODE"] = new DATATYPE_UNICODE();
    datatypes["MAILBOX"] = new DATATYPE_MAILBOX();
    datatypes["BLOB"] = new DATATYPE_BLOB();

    idToDatatype[1] = datatypes["STRING"];
    idToDatatype[2] = datatypes["UINT8"];
    idToDatatype[3] = datatypes["UINT16"];
    idToDatatype[4] = datatypes["UINT32"];
    idToDatatype[5] = datatypes["UINT64"];

    idToDatatype[6] = datatypes["INT8"];
    idToDatatype[7] = datatypes["INT16"];
    idToDatatype[8] = datatypes["INT32"];
    idToDatatype[9] = datatypes["INT64"];

    idToDatatype[10] = datatypes["PYTHON"];
    idToDatatype[11] = datatypes["BLOB"];
    idToDatatype[12] = datatypes["UNICODE"];
    idToDatatype[13] = datatypes["FLOAT"];
    idToDatatype[14] = datatypes["DOUBLE"];
    idToDatatype[15] = datatypes["VECTOR2"];
    idToDatatype[16] = datatypes["VECTOR3"];
    idToDatatype[17] = datatypes["VECTOR4"];
}

export function Reset()
{
    datatypes = {};
    idToDatatype = {};

    InitDatatypeMapping();
}
