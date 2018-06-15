
import MemoryStream from "./MemoryStream"

const MAX_BUFFER: number = 1460 * 4;

export default class Bundle
{
    private stream: MemoryStream;

    constructor()
    {
        this.stream = new MemoryStream(MAX_BUFFER);
    }
}