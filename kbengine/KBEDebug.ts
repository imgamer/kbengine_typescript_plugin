
export default class KBEDebug
{
    static cc = cc || undefined;    // 针对cc平台输出信息，可能多余

    static DEBUG_MSG(msg: string, ...optionalParams: any[]): void
    {
        optionalParams.unshift(msg);
        console.debug.apply(this, optionalParams);
    }

    static INFO_MSG(msg: string, ...optionalParams: any[]): void
    {
        optionalParams.unshift(msg);
        if (cc !== undefined) 
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
        if (cc !== undefined) 
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
        if (cc !== undefined) 
        {
            cc.error.apply(this, optionalParams);
        }
        else 
        {
            console.error.apply(this, optionalParams);
        }
    }
}
