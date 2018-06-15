import KBEDebug from "./KBEDebug";

export default class Message
{
    static messages: {[key:string]: Message};

    id: number;
    name: string;
    length: number;
    argsType: number;

    constructor()
    {
        for(let key in Message.messages)
        {
            KBEDebug.WARNING_MSG("Message::constructor:let key(%s) in Message.messages............value(%s)", key, Message.messages[key]);
        }
    }

}