
import {INT64, UINT64} from "./DataTypes";
import KBEDebug from "./KBEDebug";

class PackFloatXType
{
    private _unionData: ArrayBuffer;
    fv: Float32Array;
    uv: Uint32Array;
    iv: Int32Array;

    constructor()
    {
        this._unionData = new ArrayBuffer(4);
        this.fv = new Float32Array(this._unionData);
        this.uv = new Uint32Array(this._unionData);
        this.iv = new Int32Array(this._unionData);
    }
}

export default class MemoryStream
{
    rpos: number = 0;
    wpos: number = 0;
    private buffer: ArrayBuffer;

    constructor(size_or_buffer: number | ArrayBuffer)
    {
        if(size_or_buffer instanceof ArrayBuffer)
        {
            this.buffer = size_or_buffer;
        }
        else
        {
            this.buffer = new ArrayBuffer(size_or_buffer);
        }
    }

    Space(): number
    {
        return this.buffer.byteLength - this.wpos;
    }

    ReadInt8(): number
    {
        let buf = new Int8Array(this.buffer, this.rpos);
        this.rpos += 1;
        return buf[0];
    }

    ReadUint8(): number
    {
        let buf = new Uint8Array(this.buffer, this.rpos);
        this.rpos += 1;
        return buf[0];
    }

    ReadUint16(): number
    {
        let buf = new Uint8Array(this.buffer, this.rpos);
        this.rpos += 2;
        return ((buf[1] & 0xff) << 8) + (buf[0] & 0xff);
    }

    ReadInt16(): number
    {
        let value = this.ReadUint16();
        if(value >= 32768)
            value -= 65536;
        return value;
    }

    ReadUint32(): number
    {
        let buf = new Uint8Array(this.buffer, this.rpos);
        this.rpos += 4;

        return (buf[3] << 24) + (buf[2] << 16) + (buf[1] << 8) + buf[0];
    }

    ReadInt32(): number
    {
        let value = this.ReadUint32();
        if(value >= 2147483648)
            value -= 4294967296;
        return value;
    }

    ReadUint64(): UINT64
    {
        return new UINT64(this.ReadUint32(), this.ReadUint32());
    }

    ReadInt64(): INT64
    {
        return new INT64(this.ReadUint32(), this.ReadUint32());
    }

    ReadFloat(): number
    {
        let buf = new Float32Array(this.buffer, this.rpos);
        this.rpos += 4;

        return buf[0];
    }

    ReadDouble(): number
    {
        let buf = new Float64Array(this.buffer, this.rpos);
        this.rpos += 8;

        return buf[0];
    }

    ReadString(): string
    {
        let buf = new Int8Array(this.buffer, this.rpos);
        let value: string = "";
        let index: number = 0;
        
        while(true)
        {
            if(buf[index] != 0 )
            {
                value += String.fromCharCode(buf[index]);
                index += 1;
                if(this.rpos + index >= this.buffer.byteLength)
                {
                    throw(new Error("KBEngine.MemoryStream::ReadString overflow(>=) max length:" + this.buffer.byteLength));
                }
            }
            else
            {
                index += 1;
                break;
            }
        }

        this.rpos += index;
        return value;
    }

    ReadBlob(): Uint8Array
    {
        let size = this.ReadUint32();
        let buf = new Uint8Array(this.buffer, this.rpos, size);
        this.rpos += size;
        return buf;
    }

    ReadStream(): MemoryStream
    {
        let buf = new Uint8Array(this.buffer, this.rpos, this.buffer.byteLength - this.rpos);
        this.rpos = this.buffer.byteLength;
        return new MemoryStream(buf);
    }

    ReadPackXZ(): Array<number>
    {
        let xPackData = new PackFloatXType();
        let zPackData = new PackFloatXType();

        xPackData.fv[0] = 0.0;
        zPackData.fv[0] = 0.0;

        xPackData.uv[0] = 0x40000000;
        zPackData.uv[0] = 0x40000000;
		var v1 = this.ReadUint8();
		var v2 = this.ReadUint8();
		var v3 = this.ReadUint8();

		let data = 0;
		data |= (v1 << 16);
		data |= (v2 << 8);
		data |= v3;

		xPackData.uv[0] |= (data & 0x7ff000) << 3;
		zPackData.uv[0] |= (data & 0x0007ff) << 15;

		xPackData.fv[0] -= 2.0;
		zPackData.fv[0] -= 2.0;
	
		xPackData.uv[0] |= (data & 0x800000) << 8;
		zPackData.uv[0] |= (data & 0x000800) << 20;
		
		var xzData = new Array(2);
		xzData[0] = xPackData.fv[0];
		xzData[1] = zPackData.fv[0];
		return xzData;
    }

    ReadPackY(): number
    {
        return this.ReadUint16();
    }

    WriteInt8(value: number): void
    {
        let buf = new Int8Array(this.buffer, this.wpos, 1);
        buf[0] = value;
        this.wpos += 1;
    }

    WriteInt16(value: number): void
    {
        this.WriteInt8(value & 0xff);
        this.WriteInt8((value >> 8) & 0xff);
    }

    WriteInt32(value: number): void
    {
        for(let i = 0; i < 4; i++)
            this.WriteInt8((value >> i * 8) & 0xff);
    }

    WriteInt64(value: INT64): void
    {
        this.WriteInt32(value.low);
        this.WriteInt32(value.high);
    }

    WriteUint8(value: number): void
    {
        let buf = new Uint8Array(this.buffer, this.wpos, 1);
        buf[0] = value;
        this.wpos += 1;
    }

    WriteUint16(value: number): void
    {
        this.WriteUint8(value & 0xff);
        this.WriteUint8((value >> 8) & 0xff);
    }

    WriteUint32(value: number): void
    {
        for(let i = 0; i < 4; i++)
            this.WriteUint8((value >> i*8) & 0xff);
    }

    WriteUint64(value: UINT64): void
    {
        this.WriteUint32(value.low);
        this.WriteUint32(value.high);
    }

    WriteFloat(value: number): void
    {
        let buf = new Float32Array(this.buffer, this.wpos, 1);
        buf[0] = value;
        this.wpos += 4;
    }

    WriteDouble(value: number): void
    {
        let buf = new Float64Array(this.buffer, this.wpos, 1);
        buf[0] = value;
        this.wpos += 8;
    }

    WriteBlob(value: string|Uint8Array): void
    {
        let size = value.length;
        if(size + 4 > this.Space())
        {
            KBEDebug.ERROR_MSG("KBE.MemoryStream:WriteBlob:there is no space for size:%d", size + 4);
            return;
        }

        this.WriteUint32(size);

        let buf = new Uint8Array(this.buffer, this.wpos, size);
        if(typeof(value) == "string")
        {
            for(let i = 0; i < size; i++)
            {
                buf[i] = value.charCodeAt(i);
            }
        }
        else
        {
            for(let i = 0; i< size; i++)
            {
                buf[i] = value[i];
            }
        }

        this.wpos += size;
    }

    WriteString(value: string): void
    {

        if(value.length + 1 > this.Space())
        {
            KBEDebug.ERROR_MSG("KBE.MemoryStream:WriteString:there is no space for size:%d", value.length + 1);
            return;
        }

        let buf = new Uint8Array(this.buffer, this.wpos, value.length);
        for(let i = 0; i < value.length; i++)
        {
            buf[i] = value.charCodeAt(i);
        }

        buf[value.length] = 0;
        this.wpos = this.wpos + value.length + 1;
    }

    ReadSkip(count: number): void
    {
        this.rpos += count;
    }

    Length(): number
    {
        return this.wpos - this.rpos;
    }

    ReadEOF(): boolean
    {
        return this.buffer.byteLength - this.rpos <= 0;
    }

    Done(): void
    {
        this.rpos = this.wpos;
    }

    GetBuffer(): ArrayBuffer
    {
        return this.buffer.slice(this.rpos, this.wpos);
    }

    GetRawBuffer(): ArrayBuffer
    {
        return this.buffer;
    }
}