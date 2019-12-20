import GameObject from './gameObject.js'
//Clase para objetos recogibles del juego
export default class Collectible extends GameObject{
    constructor(scene, column, row, texture, tileSize)
    {
        super(scene, column, row, texture,tileSize);
        this.body.setSize(10,10);
        this.setDepth(2);
    }

}