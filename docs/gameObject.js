//Clase para objetos recogibles del juego
export default class GameObject extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, column, row, texture, tileSize)
    {
        super(scene, (column * tileSize) + tileSize/2, (row * tileSize) + tileSize/2, texture);
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.column = column;
        this.row = row;
        this.tileSize = tileSize;
    }
    UpdateTilePos(){
        this.column = Math.floor(this.x / this.tileSize);
        this.row = Math.floor(this.y / this.tileSize);
    }
    ReturnTile()
    {
        let tile = {column: this.column, row: this.row}
        return tile;
    }

    ReturnPos()
    {
      let pos = {x: this.x,  y: this.y};
      return pos;
    }
}