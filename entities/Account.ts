
import Entity from "../kbengine/Entity";
import KBEDebug from "../kbengine/KBEDebug";
import {RegisterScript} from "./ExportEntity";
import * as Datatypes from "../kbengine/DataTypes";


export default class Account extends Entity
{
    static SCRIPT_NAME = "Account";

    set_dbidFromClient(oldval: any)
    {
        KBEDebug.DEBUG_MSG("Entity::set_dbidFromClient------------------->>>id:%d value:%s.", this.id, this["dbidFromClient"].toString());
        
    }

    set_wxnickname(oldval: any)
    {
        KBEDebug.DEBUG_MSG("Entity::set_wxnickname------------------->>>id:%d value:%s.", this.id, this["wxnickname"].toString());
        let val = 50;
        let low = 0x00001111 & val;
        let high = 0x11110000 & val;
        let u64data = new Datatypes.UINT64(low, high);
        this.BaseCall("pingBase", u64data);
    }

    pingBack(time: Datatypes.UINT64)
    {
        KBEDebug.DEBUG_MSG("Entity::pingBack------------------->>>id:%d value:%s.", this.id, time.toString());
    }
}

RegisterScript(Account);
