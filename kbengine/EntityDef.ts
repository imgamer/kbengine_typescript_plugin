import {DATATYPE_BASE} from "./DataTypes";
import Entity from "./Entity";
import KBEDebug from "./KBEDebug";
import * as ExportEntity from "./../entities/ExportEntity";

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
    flags: number = 0;
    aliasID: number = -1;

    defaultValStr: string = "";
    setHandler: Function = undefined;
    value: any = undefined;

    IsBase(): boolean
    {
        return this.flags === EntityDataFlags.ED_FLAG_BASE_AND_CLIENT || 
                this.flags === EntityDataFlags.ED_FLAG_BASE;
    }

    IsOwnerOnly(): boolean
    {
        return this.flags === EntityDataFlags.ED_FLAG_CELL_PUBLIC_AND_OWN || 
                this.flags === EntityDataFlags.ED_FLAG_OWN_CLIENT;
    }

    IsOtherOnly(): boolean
    {
        return this.flags === EntityDataFlags.ED_FLAG_OTHER_CLIENTS;
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
    script: any;

    propertys = {};
    methods = {};
    baseMethods = {};
    cellMethods = {};

    constructor(moduleName: string)
    {
        this.script = ExportEntity.GetEntityScript(moduleName);
        if(this.script === undefined)
        {
            //throw(Error("ScriptModule::cant find script:" + moduleName));
        }
    }

    async AsyncInit(moduleName: string)
    {
        this.name = moduleName;
        let module: any = undefined;
        let path: string = "../../kbengine_typescript_plugin/kbengine/Entity";
        KBEDebug.INFO_MSG("ScriptModule::AsyncInit:try to load script %s.", path);
        try
        {
            module = await import(path);
            //module = await import("../entities/Account");
        }
        catch(e)
        {
            KBEDebug.ERROR_MSG("ScriptModule::AsyncInit:can't load(Entity script:%s,error:%s!", moduleName, e);
        }
        
        this.script = module.default;
        KBEDebug.INFO_MSG("ScriptModule::AsyncInit:load script %s.", this.script);
    }

    GetScriptSetMethod(name: string)
    {
        if(this.script === undefined)
        {
            KBEDebug.INFO_MSG("ScriptModule::GetScriptSetMethod(name:%s):script(%s) is undefined.", name, this.name);
            return undefined;
        }

        return this.script.prototype["set_" + name];
    }
}

export var MODULE_DEFS = {}
export function Clear()
{
    MODULE_DEFS = {};
}

class EntityDef
{
    static moduleDefs = {};

    static Clear()
    {
        this.moduleDefs = {};
    }
}



