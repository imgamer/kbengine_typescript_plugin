
import MemoryStream from "./MemoryStream"
import Message from "./Message";
import {INT64, UINT64} from "./Number64Bits";
import NetworkInterface from "./NetworkInterface";

const MAX_BUFFER: number = 1460 * 4;
const MESSAGE_ID_LENGTH: number = 2;

export default class Bundle
{
    private stream: MemoryStream = new MemoryStream(MAX_BUFFER);
    private streams: Array<MemoryStream> = new Array<MemoryStream>();

    private messageNum = 0;
    private messageLengthBuffer: Uint8Array = null;
    private messageLength = 0;
    private message: Message = null;

    constructor()
    {
    }

    WriteMessageLength(len: number)
    {
        if(this.messageLengthBuffer)
        {
            this.messageLengthBuffer[0] = len & 0xff;
            this.messageLengthBuffer[1] = (len >> 8) & 0xff;
        }
    }

    Fini(isSend: boolean)
    {
        if(this.messageNum > 0)
        {
            this.WriteMessageLength(this.messageLength);
            if(this.stream)
            {
                this.streams.push(this.stream);
            }
        }

        if(isSend)
        {
            this.messageLengthBuffer = null;
            this.messageNum = 0;
            this.message = null;
        }
    }

    NewMessage(message: Message)
    {
        this.Fini(false);

        this.messageNum += 1;
        this.message = message;

        if(message.length == -1)
        {
            this.messageLengthBuffer = new Uint8Array(this.stream.GetBuffer(), this.stream.wpos + MESSAGE_ID_LENGTH, 2);
        }

        this.stream.WriteUint16(message.id);
        
        if(this.messageLengthBuffer)
        {
            this.WriteUint16(0);
            this.messageLengthBuffer[0] = 0;
            this.messageLengthBuffer[1] = 0;
            this.messageLength = 0;
        }
    }

    Send(networkInterface: NetworkInterface)
    {
        this.Fini(true);

        for(let stream of this.streams)
        {
            this.stream = stream;
            // TODO: network.send(this.stream.Getbuffer());
        }

        this.streams = new Array<MemoryStream>();
        this.stream = new MemoryStream(MAX_BUFFER);
    }

    CheckStream(len: number)
    {
        if(len > this.stream.Space())
        {
            this.streams.push(this.stream);
            this.stream = new MemoryStream(MAX_BUFFER);
        }

        this.messageLength += len;
    }

    WriteInt8(value: number)
    {
        this.CheckStream(1);
        this.stream.WriteInt8(value);
    }

	WriteInt16(value: number)
	{
		this.CheckStream(2);
		this.stream.WriteInt16(value);
    }

    WriteInt32(value: number)
	{
		this.CheckStream(4);
		this.stream.WriteInt32(value);
    }
    
    WriteInt64(value: INT64)
	{
		this.CheckStream(8);
		this.stream.WriteInt64(value);
    }
    
    WriteUint8(value: number)
    {
        this.CheckStream(1);
        this.stream.WriteUint8(value);
    }

    WriteUint16(value: number)
    {
        this.CheckStream(2);
        this.stream.WriteUint16(value);
    }

    WriteUint32(value: number)
    {
        this.CheckStream(4);
        this.stream.WriteUint32(value);
    }

    WriteUint64(value: UINT64)
    {
        this.CheckStream(8);
        this.stream.WriteUint64(value);
    }

    WriteFloat(value: number)
    {
        this.CheckStream(4);
        this.stream.WriteFloat(value);
    }

    WriteDouble(value: number)
    {
        this.CheckStream(8);
        this.stream.WriteDouble(value);
    }

    WriteBlob(value: string|Uint8Array)
    {
        this.CheckStream(value.length + 1);
        this.stream.WriteBlob(value);
    }

    WriteString(value: string)
    {
        this.CheckStream(value.length + 4);
        this.stream.WriteString(value);
    }
}