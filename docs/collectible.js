//Clase para objetos recogibles del juego
export default class Collectible extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, column, row, texture)
    {
        super(scene, (column * 50) + 25, (row * 50) + 25, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(10,10);
        this.column = column;
        this.row = row;
        this.setDepth(2);
    }

}