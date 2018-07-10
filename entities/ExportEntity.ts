
import KBEDebug from "../kbengine/KBEDebug";
//import Account from "./Account";  // note：会导致循环引用，因此提供RegisterScript来注册脚本。

// 把所有的entity脚本都注册到此处
var EntityScripts = {};
//EntityScripts[Account.className] = Account;

export function RegisterScript(script: any)
{
    EntityScripts[script.SCRIPT_NAME] = script;
}

export function GetEntityScript(name: string)
{
    let script =  EntityScripts[name];
    if(script === undefined)
    {
        KBEDebug.ERROR_MSG("ExportEntity::GetEntityScript(%s) is undefined.", name);
    }

    return script;
}
