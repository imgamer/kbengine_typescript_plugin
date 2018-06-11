
import KBEDebug from "./KBEDebug";

class EventInfo
{
    m_object: object;
    m_cbFunction: Function;

    constructor(p_object: object, cbFunction: Function)
    {
        this.m_object = p_object;
        this.m_cbFunction = cbFunction;
    }
}


export default class KBEEvent
{
    private static _events: {} = {};

    static Register(eventName: string, p_object: object, cbFunction: Function): void
    {
        let eventList: Array<EventInfo> = this._events[eventName];  // 或者let eventList: EventInfo[] = [];
        if(eventList === undefined)
        {
            eventList = [];
            this._events[eventName] = eventList;
        }
        let eventInfo: EventInfo = new EventInfo(p_object, cbFunction);
        eventList.push(eventInfo);
    }

    static Deregister(eventName: string, cbFunction: Function): void
    {
        let eventList: Array<EventInfo> = this._events[eventName];
        if(eventList === undefined)
        {
            KBEDebug.ERROR_MSG("Event::Deregister:cant find event by name(%s).", eventName);
            return;
        }

        let hasFound: boolean = false;
        for (let item of eventList)
        {
            // 注意，严格模式下，arguments,call等被禁用，不可访问这些成员
            //KBEDebug.WARNING_MSG("Event::Deregister:let key of eventList.:" +item.m_cbFunction.toString());

            if(item.m_cbFunction === cbFunction)
            {
                let index: number = eventList.indexOf(item);
                eventList.splice(index, 1);
                KBEDebug.WARNING_MSG("Event::Deregister:item.m_cbFunction === cbFunction...delete index:%d", index);
                hasFound = true;
                break;
            }
        }
        if(!hasFound)
        {
            KBEDebug.ERROR_MSG("Event::Deregister:cant find event by Function(event name:%s).", eventName);
        }
    }

    static Fire(eventName: string, ...params: any[]): void
    {
        let eventList: Array<EventInfo> = this._events[eventName];
        if(eventList === undefined)
        {
            KBEDebug.INFO_MSG("Event::Fire:cant find event by name(%s).", eventName);
            return;
        }

        for(let item of eventList)
        {
            try
            {
                // 注意，传入和注册函数参数类型数量不一致也不会出错，作为事件函数的参数类型检查没有作用
                // this指针是什么不得而知，可能是当前的上下文Event对象，因此必须使用apply绑定原对象
                // error：item.m_cbFunction(params); 
                item.m_cbFunction.apply(item.m_object, params);
            }
            catch(e)
            {
                KBEDebug.ERROR_MSG("Event::Fire(%s):%s", eventName, e);
            }
        }
    }

    static DeregisterObject(p_object: object): void
    {
        let deleteCount: number = 0;
        for(let key in this._events)
        {
            let eventList: Array<EventInfo> = this._events[key];
            for(let item of eventList)
            {
                if(item.m_object === p_object)
                {
                    let index: number = eventList.indexOf(item);
                    eventList.splice(index, 1);
                    deleteCount += 1;
                }
            }
        }

        KBEDebug.DEBUG_MSG("KBEEvent::DeregisterObject %s:delete count:%d.", p_object.toString(), deleteCount);
    }
}