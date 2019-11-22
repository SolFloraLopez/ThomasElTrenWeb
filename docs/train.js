import {directionEnum, matrixEnum, stateEnum, } from './Enums.js'

export default class Train extends Phaser.Physics.Arcade.Sprite
{ 
    constructor(scene, x, y, texture, speed, direction)
    {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true)
        this.body.setSize(40,40);

        this.column = Math.floor(this.x / 50);
        this.row = Math.floor(this.y / 50);
        this.direction = direction;
        this.angle = this.direction * 90;
        this.speed = speed;
        this.state = stateEnum.ONTRACK;
        this.setDepth(1);
    }

    preUpdate(time,delta)
     {
        if (this.state == stateEnum.ONTRACK) 
        {
            this.Move(this.speed,time,delta);
            this.column = Math.floor(this.x / 50);
            this.row = Math.floor(this.y / 50);
        }
        //console.table([{name: 'column', amount: this.column}, {name: 'row', amount: this.row}, {name: 'x', amount: this.x}, {name: 'y', amount: this.y}]);
    }


     
    Move(amount,time,delta)
    {
        this.body.setVelocity(0);
        if(this.direction !== directionEnum.NONE){
            if(this.direction === directionEnum.UP || this.direction === directionEnum.DOWN) this.body.setVelocityY(amount * delta * this.direction/2)
            else this.body.setVelocityX(amount * delta * this.direction);
        }
        

    }
    //dado un rail comprueba todos los casos de entrada que no son compatibles y la direccion que va a tomar tras cruzarlo, en caso de que sea compatible
    Compatible(rail){
        let offset = 10;
        let railType = rail.ReturnRailType();

        switch(this.direction){

            case directionEnum.UP:
                if((railType === 0 || railType === 1) && this.y > rail.ReturnPos().y + offset) return false;
                else if(this.y<rail.ReturnPos().y){
                    if(railType === 2) this.ChangeDirection(directionEnum.LEFT);
                    else if(railType === 3)this.ChangeDirection(directionEnum.RIGHT);
                } 
                break;
            case directionEnum.DOWN:
                if((railType === 2 || railType === 3) && this.y < rail.ReturnPos().y - offset)return false;
                else if(this.y > rail.ReturnPos().y){
                    if(railType === 0) this.ChangeDirection(directionEnum.LEFT);
                    else if(railType === 1) this.ChangeDirection(directionEnum.RIGHT);
                } 
                break;
            case directionEnum.LEFT:
                    if((railType === 0 || railType === 2) && this.x > rail.ReturnPos().x + offset)return false;
                    else if(this.x < rail.ReturnPos().x){
                        if(railType === 1)this.ChangeDirection(directionEnum.UP);
                        else if(railType === 3)this.ChangeDirection(directionEnum.DOWN);
                    } 
                break;
            case directionEnum.RIGHT:
                     if((railType === 1 || railType === 3) && this.x < rail.ReturnPos().x - offset)return false;
                     else if(this.x > rail.ReturnPos().x){
                        if(railType === 0)this.ChangeDirection(directionEnum.UP);
                        else if(railType === 2)this.ChangeDirection(directionEnum.DOWN);
                    } 
                break;
        }
        return true;

    }

    ChangeDirection(direction)
    {
        this.direction = direction;
        this.angle = this.direction * 90;
    }

    ReturnPos()
    {
       let pos = {x: this.x,  y: this.y};
       return pos;
    }

    ReturnTile()
    {
        let tile = {column: this.column, row: this.row}

        return tile;
    }

    ReturnDirection()
    {
        return this.direction;
    }

    ChangeState(state) 
    {
        this.state = state;
    }
}

