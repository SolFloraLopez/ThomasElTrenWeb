import GameObject from './gameObject.js'
//Clase para el agua del nivel
export default class Water extends GameObject{
    constructor(scene, column, row, texture, tileSize)
    {
        super(scene, column, row, texture, tileSize);
        this.setInteractive();
        this.body.setSize(20,20);
        this.avoidable = false;
        this.setDepth(0);
    }
    SetAvoidable(bool)
    {
        this.avoidable = bool;
    }

}