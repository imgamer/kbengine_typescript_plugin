
import Entity from "../kbengine/Entity";
import {RegisterScript} from "./ExportEntity";

export default class Account extends Entity
{
    static className = "Account";
}

RegisterScript(Account);
