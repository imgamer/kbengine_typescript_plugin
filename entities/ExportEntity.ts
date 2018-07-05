
import KBEDebug from "../kbengine/KBEDebug";
import Account from "./Account";

// 把所有的entity脚本都注册到此处
var EntityScripts = {};
EntityScripts[Account.SCRIPT_NAME] = Account;


export function GetEntityScript(name: string)
{
    let script =  EntityScripts[name];
    if(script === undefined)
    {
        KBEDebug.ERROR_MSG("ExportEntity::GetEntityScript(%s) is undefined.", name);
    }

    return script;
}
