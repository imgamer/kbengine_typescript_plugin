// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import * as KBEMath from "./KBEMath";
import {KBEngineApp} from "./KBEngine";
import KBEDebug from "./KBEDebug";

export default class Entity
{
    static className = "Entity";

    id: number;

    position: KBEMath.Vector3 = new KBEMath.Vector3(0, 0, 0);
    direction: KBEMath.Vector3 = new KBEMath.Vector3(0, 0, 0);
    entityLastLocalPos = new KBEMath.Vector3(0.0, 0.0, 0.0);
    entityLastLocalDir = new KBEMath.Vector3(0.0, 0.0, 0.0);

    inWord: boolean = false;
    inited: boolean = false;
    isControlled: boolean = false;
    isOnGround: boolean = false;

    cell: any;
    base: any;

    Name: string = "wsf";

    __init__()
    {
        this.inited = true;
    }

    CallPropertysSetMethods()
    {
    }

    OnDestroy()
    {

    }

    OnControlled()
    {}

    IsPlayer(): boolean
    {
        return KBEngineApp.app.entity_id === this.id;
    }

    BaseCall(methodName: string, ...args: any[])
    {
        
    }

    CellCall(methodName: string, ...args: any[])
    {

    }

    EnterWorld()
    {
        this.OnEnterWorld();
    }

    OnEnterWorld()
    {

    }

    LeaveWorld()
    {
        this.OnLeaveWorld();
    }

    OnLeaveWorld()
    {

    }

    EnterSpace()
    {
        this.OnEnterSpace();
    }

    OnEnterSpace()
    {

    }

    LeaveSpace()
    {
        this.OnLeaveSpace();
    }

    OnLeaveSpace()
    {

    }

    OnUpdateVolatileData()
    {}

    Set_position(oldVal: KBEMath.Vector3)
    {}

    Set_direction(oldVal: KBEMath.Vector3)
    {}
}

