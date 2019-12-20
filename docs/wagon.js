import GameObject from './gameObject.js'
//Clase para los vagones del juego
export default class Wagon extends GameObject
{ 
    constructor(scene,targetToFollow,spacer, updateTime, column, row, texture, tileSize)
    {
        super(scene, column, row, texture,tileSize);
        this.body.setSize(40,40);

        this.wagonPath=[];
        this.target = targetToFollow;
        this.spacer = spacer;
        this.updateTime = updateTime;
        this.deltaCounter = 0;

        this.setDepth(3);
        for (let i = 0; i <= this.spacer; i++)
        {
          this.wagonPath[i] = new Phaser.Geom.Point(this.target.x, this.target.y);
        }
    }

    //Los vagones poseen un array de puntos formando un camino, a traves del cual se mueven. 
    preUpdate(time,delta)
     {
        super.UpdateTilePos();

        this.deltaCounter += delta / 1000;

        while(this.deltaCounter >= this.updateTime)
        {
            let part = this.wagonPath.pop();

            part.setTo(this.target.x, this.target.y);
            this.wagonPath.unshift(part);
            
            if(this.x !== (this.wagonPath[this.wagonPath.length - 1]).x) this.angle = 90;
            else if(this.y !== (this.wagonPath[this.wagonPath.length - 1]).y) this.angle = 0;
    
            this.x = (this.wagonPath[this.wagonPath.length - 1]).x;
            this.y = (this.wagonPath[this.wagonPath.length - 1]).y;

            this.deltaCounter -= this.updateTime;
        }
        
    }
}

