
export default class KBEDebug
{
    static KBE_CC_PLATFORM = typeof cc != "undefined";  // 特别针对cc平台

    static DEBUG_MSG(msg: string, ...optionalParams: any[]): void
    {
        optionalParams.unshift(msg);
        console.debug.apply(this, optionalParams);
    }

    static INFO_MSG(msg: string, ...optionalParams: any[]): void
    {
        optionalParams.unshift(msg);
        if (this.KBE_CC_PLATFORM) 
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
        if (this.KBE_CC_PLATFORM) 
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
        if (this.KBE_CC_PLATFORM) 
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
        // 使用抛出异常的方式来实现类似断言功能
        if(!condition)
        {
            throw(new Error(message));
        }

        // note：微信小游戏平台不支持，手册中提到的CC_WECHATGAME未定义，无法区分是否微信小游戏平台，
        // console.assert(condition, message, ...data);
    }
}
