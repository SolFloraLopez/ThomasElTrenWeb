import {directionEnum, matrixEnum, stateEnum, } from './Enums.js'

export default class Wagon extends Phaser.Physics.Arcade.Sprite
{ 
    constructor(scene,targetToFollow,spacer, wagonThreshold, x, y, texture)
    {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(40,40);

        this.wagonPath=[];
        this.target = targetToFollow;
        this.spacer = spacer;
        this.counter = 0;
        this.wagonThreshold = wagonThreshold;
        this.reduceSpacer = false;

        this.column = Math.floor(this.x / 50);
        this.row = Math.floor(this.y / 50);
        // this.direction = direction;
        // this.angle = this.direction * 90;
        this.setDepth(1);
        for (var i = 0; i <= this.spacer; i++)
        {
          this.wagonPath[i] = new Phaser.Geom.Point(this.target.x, this.target.y);
        }
    }

    preUpdate(time,delta)
     {
        this.column = Math.floor(this.x / 50);
        this.row = Math.floor(this.y / 50);

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
        
    }

    ReturnTile()
    {
        let tile = {column: this.column, row: this.row}

        return tile;
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

