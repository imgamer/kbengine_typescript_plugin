import {DATATYPE_BASE} from "./DataTypes";

enum EntityDataFlags
{
    ED_FLAG_UNKOWN													= 0x00000000, // 未定义
    ED_FLAG_CELL_PUBLIC												= 0x00000001, // 相关所有cell广播
    ED_FLAG_CELL_PRIVATE											= 0x00000002, // 当前cell
    ED_FLAG_ALL_CLIENTS												= 0x00000004, // cell广播与所有客户端
    ED_FLAG_CELL_PUBLIC_AND_OWN										= 0x00000008, // cell广播与自己的客户端
    ED_FLAG_OWN_CLIENT												= 0x00000010, // 当前cell和客户端
    ED_FLAG_BASE_AND_CLIENT											= 0x00000020, // base和客户端
    ED_FLAG_BASE													= 0x00000040, // 当前base
    ED_FLAG_OTHER_CLIENTS											= 0x00000080, // cell广播和其他客户端
}

export class Property
{
    name: string = "";
    utype: DATATYPE_BASE = undefined;
    properUtype: number = 0;
    properFlags: number = 0;
    aliasID: number = -1;

    defaultValStr: string = "";
    handler: Function = undefined;

    IsBase(): boolean
    {
        return this.properFlags === EntityDataFlags.ED_FLAG_BASE_AND_CLIENT || 
                this.properFlags === EntityDataFlags.ED_FLAG_BASE;
    }

    IsOwnerOnly(): boolean
    {
        return this.properFlags === EntityDataFlags.ED_FLAG_CELL_PUBLIC_AND_OWN || 
                this.properFlags === EntityDataFlags.ED_FLAG_OWN_CLIENT;
    }

    IsOtherOnly(): boolean
    {
        return this.properFlags === EntityDataFlags.ED_FLAG_OTHER_CLIENTS;
    }
}

export class Method
{
    name: string = "";
    methodUtype: number = 0;
    aliasID: number = 0;
    args: Array<DATATYPE_BASE> = new Array<DATATYPE_BASE>();
    handler: Function = undefined;
}

export class ScriptModule
{
    name: string = "";
    usePropertyDescrAlias: boolean = false;
    useMethodDescrAlias: boolean = false;

    propertys = {};
    methods = {};
    baseMethods = {};
    cellMethods = {};

    constructor(moduleName: string)
    {
        this.name = moduleName;

        // TODO: 动态加载对应名字的entity模块
    }
}


export var moduleDefs = {}
export function Clear()
{
    moduleDefs = {};
}

class EntityDef
{
    static moduleDefs = {};

    static Clear()
    {
        this.moduleDefs = {};
    }
}



