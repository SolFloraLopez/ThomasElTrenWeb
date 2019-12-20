
export default class Water extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, column, row, texture, tileSize)
    {
        super(scene, (column * tileSize) + tileSize/2, (row * tileSize) + tileSize/2, texture);
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