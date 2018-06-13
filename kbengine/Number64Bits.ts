
export class INT64
{
    low: number;
    high: number;
    sign: number = 1;

    constructor(p_low: number, p_high: number)
    {
        this.low = p_low;
        this.high = p_high;
        
        if(p_high >= 2147483648)
        {
            this.sign = -1;
            this.low = (4294967296 - this.low) & 0xffffffff;
            if(p_low > 0)
            {
                this.high = 4294967295 - this.high;
            }
            else
            {
                this.high = 4294967296 - this.high;
            }
        }
    }

    toString()
    {
		let result: string = "";
		
		if(this.sign < 0)
		{
			result += "-"
		}
		
		let low = this.low.toString(16);
		let high = this.high.toString(16);
		
		if(this.high > 0)
		{
			result += high;
			for(let i = 8 - low.length; i > 0; --i)
			{
				result += "0";
			}
		}
		
		return result + low;
    }
}

export class UINT64
{
    low: number;
    high: number;

    constructor(p_low: number, p_high: number)
    {
        this.low = p_low;
        this.high = p_high;
    }

    toString()
    {
		var low = this.low.toString(16);
		var high = this.high.toString(16);
		
		var result = "";
		if(this.high > 0)
		{
			result += high;
			for(var i = 8 - low.length; i > 0; --i)
			{
				result += "0";
			}
		}

		return result + low;
    }
}