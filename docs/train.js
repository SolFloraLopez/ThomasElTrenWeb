import GameObject from './gameObject.js'
import {directionEnum} from './Enums.js'
//Clase para el principal objeto tren
export default class Train extends GameObject
{ 
    constructor(scene, column, row, texture, tileSize, speed, direction)
    {
        super(scene, column, row, texture, tileSize);
        this.body.setSize(35,35);

        this.direction = direction;
        this.angle = this.direction * 90;
        this.speed = speed;
        this.setDepth(3);
    }

    preUpdate(time,delta)
     {
        this.Move(this.speed, delta);
        super.UpdateTilePos();
    }
     
    Move(amount, delta)
    {
        this.body.setVelocity(0);
        if(this.direction !== directionEnum.NONE){
            if(this.direction === directionEnum.UP || this.direction === directionEnum.DOWN) this.y += amount * delta / 1000 * this.direction / 2;
            else this.x += amount * delta / 1000 * this.direction;
        }

    }
    //dado un rail comprueba todos los casos de entrada que no son compatibles y la direccion que va a tomar tras cruzarlo, en caso de que sea compatible
    Compatible(rail){
        let offset = 10;
        let railType = rail.ReturnRailType();

        switch(this.direction){

            case directionEnum.UP:
                if((railType === 2 || railType === 3 || railType === 5) && this.y > rail.ReturnPos().y + offset) return false;
                else if(railType !== 4 && this.y<rail.ReturnPos().y){
                    if(railType === 1) this.ChangeDirection(directionEnum.LEFT);
                    else if(railType === 0)this.ChangeDirection(directionEnum.RIGHT);
                } 
                break;
            case directionEnum.DOWN:
                if((railType === 1 || railType === 0 || railType === 5) && this.y < rail.ReturnPos().y - offset)return false;
                else if(railType !== 4 && this.y > rail.ReturnPos().y){
                    if(railType === 2) this.ChangeDirection(directionEnum.LEFT);
                    else if(railType === 3) this.ChangeDirection(directionEnum.RIGHT);
                } 
                break;
            case directionEnum.LEFT:
                    if((railType === 2 || railType === 1 || railType === 4) && this.x > rail.ReturnPos().x + offset)return false;
                    else if(railType !== 5 && this.x < rail.ReturnPos().x){
                        if(railType === 3)this.ChangeDirection(directionEnum.UP);
                        else if(railType === 0)this.ChangeDirection(directionEnum.DOWN);
                    } 
                break;
            case directionEnum.RIGHT:
                     if((railType === 3 || railType === 0 || railType === 4) && this.x < rail.ReturnPos().x - offset)return false;
                     else if(railType !== 5 && this.x > rail.ReturnPos().x){
                        if(railType === 2)this.ChangeDirection(directionEnum.UP);
                        else if(railType === 1)this.ChangeDirection(directionEnum.DOWN);
                    } 
                break;
        }
        return true;

    }

    ChangeDirection(direction)
    {
        this.direction = direction;
        switch(direction)
        {
            case directionEnum.UP:
                this.angle = 180;
                break;
            case directionEnum.DOWN:
                this.angle = 0;
                break;
            case directionEnum.RIGHT:
                this.angle = 270;
                break;
            case directionEnum.LEFT:
                this.angle = 90;
                break;
        }
    }

    ChangeSpeed(amount)
    {
        this.speed = amount;
    }

    ReturnDirection()
    {
        return this.direction;
    }
}

