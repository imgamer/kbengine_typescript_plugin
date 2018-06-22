
export default class KBEDebug
{
    static CC_PLATFORM = typeof cc != "undefined";  // 特别针对cc平台

    static DEBUG_MSG(msg: string, ...optionalParams: any[]): void
    {
        optionalParams.unshift(msg);
        console.debug.apply(this, optionalParams);
    }

    static INFO_MSG(msg: string, ...optionalParams: any[]): void
    {
        optionalParams.unshift(msg);
        if (this.CC_PLATFORM) 
        {
            cc.info.apply(this, optionalParams);
        }
        else 
        {
            console.info.apply(this, optionalParams);
        }
    }

    static WARNING_MSG(msg: string, ...optionalParams: any[]): void
    {
        optionalParams.unshift(msg);
        if (this.CC_PLATFORM) 
        {
            cc.warn.apply(this, optionalParams);
        }
        else 
        {
            console.warn.apply(this, optionalParams);
        }
    }

    static ERROR_MSG(msg: string, ...optionalParams: any[]): void
    {
        optionalParams.unshift(msg);
        if (this.CC_PLATFORM) 
        {
            cc.error.apply(this, optionalParams);
        }
        else 
        {
            console.error.apply(this, optionalParams);
        }
    }

    static ASSERT(condition?: boolean, message?: string, ...data: any[]): void
    {
        console.assert(condition, message, ...data);
    }
}
