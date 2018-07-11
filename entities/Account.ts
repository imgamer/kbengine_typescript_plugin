
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

        let data = Datatypes.BuildUINT64(15);
        this.BaseCall("pingBase", data);
    }

    pingBack(data: Datatypes.UINT64)
    {
        KBEDebug.DEBUG_MSG("Entity::pingBack------------------->>>id:%d value:%s.", this.id, data.toString());
    }
}

RegisterScript(Account);
