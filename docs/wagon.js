import GameObject from './gameObject.js'
//Clase para los vagones del juego
export default class Wagon extends GameObject
{ 
    constructor(scene,targetToFollow,spacer, wagonThreshold, updateTime, column, row, texture, tileSize)
    {
        super(scene, column, row, texture,tileSize);
        this.body.setSize(40,40);

        this.wagonPath=[];
        this.target = targetToFollow;
        this.spacer = spacer;
        this.counter = 0;
        this.wagonThreshold = wagonThreshold;
        this.reduceSpacer = false;
        this.updateTime = updateTime;
        this.deltaCounter = 0;

        this.setDepth(3);
        for (let i = 0; i <= this.spacer; i++)
        {
          this.wagonPath[i] = new Phaser.Geom.Point(this.target.x, this.target.y);
        }
    }

    preUpdate(time,delta)
     {
        super.UpdateTilePos();

        this.deltaCounter += delta / 1000;

        while(this.deltaCounter >= this.updateTime)
        {
            let part = this.wagonPath.pop();

            if(!this.reduceSpacer)
            {
                part.setTo(this.target.x, this.target.y);
                this.wagonPath.unshift(part);
            } 

            else if (this.counter > 0)
            {
                this.counter--;
                 if (this.counter <= 0 || this.wagonPath.length < this.wagonThreshold) this.reduceSpacer = false;
            }
            
            if(this.x !== (this.wagonPath[this.wagonPath.length - 1]).x) this.angle = 90;
            else if(this.y !== (this.wagonPath[this.wagonPath.length - 1]).y) this.angle = 0;
    
            this.x = (this.wagonPath[this.wagonPath.length - 1]).x;
            this.y = (this.wagonPath[this.wagonPath.length - 1]).y;

            this.deltaCounter -= this.updateTime;
        }
        
    }

    updateCounter(amount)
    {
        this.counter += amount;
        if (this.counter >= 1) 
        {
            this.counter -= 1;
            this.reduceSpacer = true;
        } 
    }

}

