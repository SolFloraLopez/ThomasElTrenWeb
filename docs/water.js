 import {directionEnum, matrixEnum} from './Enums.js'

export default class Water extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, column, row, texture)
    {
        super(scene, (column * 50) + 25, (row * 50) + 25, texture);
        scene.add.existing(this).setInteractive();
        scene.physics.add.existing(this);
        this.body.setSize(20,20);
        this.column = column;
        this.row = row;
        this.avoidable = false;
        this.setDepth(0);

    }
    SetAvoidable(bool)
    {
        this.avoidable = bool;
    }

}