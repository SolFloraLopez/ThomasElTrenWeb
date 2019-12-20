import {stateEnum} from './enums.js'
import Inventory from './inventory.js';

export default class Rail extends Phaser.GameObjects.Sprite
{
    constructor(scene, column, row, texture, pointer, railType, tileSize,inventory)
    {
        super(scene, (column * tileSize) + tileSize / 2, (row * tileSize) + tileSize / 2, texture);
        this.scene.add.existing(this).setInteractive();
        this.scene.physics.add.existing(this);
        this.scene.input.setDraggable(this);
        this.setDepth(1);
        this.inventory = inventory;
        this.tileSize = tileSize;
        this.column = column;
        this.row = row;
        this.railType = railType;
        this.pointer = pointer;
        this.rotatable = false;

        //raíles curvos 0,1,2,3 raíles puente 4,5
        switch (this.railType)
        {
          case 0:
            this.angle = 0;
            break;
          case 1:
            this.angle = 90;
            break;
          case 2:
            this.angle = 180; 
            break;
          case 3:
            this.angle = 270;
            break;
          case 4:
            this.angle = 0;
            break;
          case 5: 
            this.angle = 90;
            break;
        }

        //Lógica de arrastre de raíl
        this.on('dragstart', function (pointer, gameObject, dragX, dragY) {
          this.scene.sound.play('dragObject');
          this.UpdateLocation();
          if(this.railType<4){
            if(this.inventory.GetRailCounter('A')>0 || (this.inventory.GetRailCounter('A')===0 && (this.column!=24 || this.row!=8))){
              this.onDrag(true);
            }
          }
          else if (this.railType>=4){
            if(this.inventory.GetRailCounter('B')>0 || (this.inventory.GetRailCounter('B')===0 && (this.column!=26 || this.row!=8))){
              this.onDrag(true);
            }
          }
        });

        this.scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            if(gameObject.railType<4){
              if(gameObject.inventory.GetRailCounter('A')>0 || (gameObject.inventory.GetRailCounter('A')===0 && (gameObject.column!=24 || gameObject.row!=8))){
                gameObject.Dragging(gameObject,dragX,dragY);
              }
            }
            else if (gameObject.railType>=4){
              if(gameObject.inventory.GetRailCounter('B')>0 || (gameObject.inventory.GetRailCounter('B')===0 && (gameObject.column!=26 || gameObject.row!=8))){
                gameObject.Dragging(gameObject,dragX,dragY);
              }
            }
          });

        this.on('dragend', function (pointer, gameObject, dragX, dragY) {
            this.scene.sound.play('dropObject');
            this.UpdateLocation();
            this.onDrag(false);
            //Para que no se pueda colocar raíles en obstáculos
            let overlapTemp = this.scene.physics.add.overlap(this,this.scene.backgroundLayer,(o1, o2) => {
              if(o2.properties.collides) this.MoveToInventory();
              overlapTemp.destroy();
            });
            //Para evitar que se coloquen raíles curvos en agua
            let overlapTemp2 = this.scene.physics.add.overlap(this,this.scene.waterGroup,(o1, o2) => {
              if(this.railType<4) this.MoveToInventory();
              overlapTemp2.destroy();
            });

            //Si el raíl que se suelta es raíl puente, busca si debajo hay una casilla de agua para cambiarla a estado "avoidable" y que el tren pueda pasar
            if(this.railType>=4){
              let pointerPos = {column: Math.floor((pointer.x/50)),row:  Math.floor((pointer.y/50))};
              let objectReturned = this.scene.SearchWater(pointerPos);
             if(objectReturned.found && !objectReturned.water.avoidable) objectReturned.water.SetAvoidable(true);
           }
            
        });

        //Si se cogen raíles del inventario disminuye el contador correspondiente
        this.on('pointerdown', ()=>{
          if(this.railType<4){
            if(this.inventory.GetRailCounter('A')>0 && (this.column===24 && this.row===8)) this.inventory.ModifyRailCounter(-1,'A');
          }
          else if (this.railType>=4){
            if(this.inventory.GetRailCounter('B')>0 && (this.column===26 && this.row===8)) this.inventory.ModifyRailCounter(-1,'B');
          }
          this.scene.CreateRail();
        });

    }

    preUpdate()
    {
      //Si se puede rotar, cambia el ángulo y el tipo al pulsar la R
      if (this.rotatable && Phaser.Input.Keyboard.JustDown(this.scene.r)){
          this.scene.sound.play('rotateObject');
          this.angle += 90;
                
          if (this.railType <= 3) this.railType = (this.railType + 1) % 4;
          else this.railType =  4 + (this.railType + 1) % 2;
      }
    }

    UpdateLocation(){
      this.column = Math.floor(this.x / this.tileSize);
      this.row = Math.floor(this.y / this.tileSize);
      this.x = (this.column * this.tileSize) + this.tileSize / 2;
      this.y = (this.row * this.tileSize) + this.tileSize / 2;
    }

    MoveToInventory(){
      if(this.railType<4){
        this.inventory.ModifyRailCounter(1,'A');
        this.column = 24;
        this.railType = 0;
      }
      else if (this.railType>=4){
        this.inventory.ModifyRailCounter(1,'B');
        this.column = 26;
        this.railType = 4;
      }
      this.row = 8;
      this.x = (this.column * this.tileSize) + this.tileSize / 2;
      this.y = (this.row * this.tileSize) + this.tileSize / 2;
      this.angle = 0;
    }
    
    ReturnTile()
    {
        let tile = {column: this.column, row: this.row}
        return tile;
    }

    ReturnRailType()
    {
        return this.railType;
    }

    ReturnPos()
    {
      let pos = {x: this.x,  y: this.y};
      return pos;
    }

    onDrag(bool){
      this.body.enable = !bool;
      this.rotatable = bool;
    }
    
    Dragging(gameObject,dragX,dragY){
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.column = Math.floor(gameObject.x / gameObject.tileSize);
    }
}