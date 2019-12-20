//Clase para objetos recogibles del juego
export default class Collectible extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, column, row, texture, tileSize)
    {
        super(scene, (column * tileSize) + tileSize/2, (row * tileSize) + tileSize/2, texture);
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setSize(10,10);
        this.column = column;
        this.row = row;
        this.setDepth(2);
    }

}