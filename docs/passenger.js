 import {directionEnum, matrixEnum} from './Enums.js'

export default class Passenger extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, column, row, texture)
    {
        super(scene, (column * 50) + 25, (row * 50) + 25, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(10,10);
        this.column = column;
        this.row = row;
        this.setDepth(1);
    }
    
    preUpdate(){
        this.column = Math.floor(this.x / 50);
        this.row = Math.floor(this.y / 50);
    }

    ReturnTile()
    {
        let tile = {column: this.column, row: this.row}
        return tile;
    }

    MoveToTile(tile)
    {
        this.x = tile.column * 50 + 25;
        this.y = tile.row * 50 + 25;
    }
}