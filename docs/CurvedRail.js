import {directionEnum, matrixEnum, stateEnum} from './Enums.js'

export default class CurvedRail extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, column, row, texture, pointer, railType, tileSize)
    {
        super(scene, (column * tileSize) + tileSize / 2, (row * tileSize) + tileSize / 2, texture);
        scene.add.existing(this).setInteractive();
        scene.physics.add.existing(this);
        scene.input.setDraggable(this);

        scene.input.on('dragstart', function (pointer, gameObject, dragX, dragY) {
          gameObject.body.enable = false;
      });
        scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
        scene.input.on('dragend', function (pointer, gameObject, dragX, dragY) {
          gameObject.body.enable = true;
      });
        
        this.tileSize = tileSize;
        this.column = column;
        this.row = row;
        this.railType = railType;
        this.selected = false;
        this.pointer = pointer;
        this.state = stateEnum.ONTRACK;

      switch (this.railType)
      {
        case 0:
          this.angle = 180;
          break;
        case 1:
          this.angle = 270;
          break;
        case 2:
          this.angle = 90; 
          break;
        case 3:
          this.angle = 0;
          break;
      }
    }

    preUpdate()
    {
        if (this.state == stateEnum.ONTRACK)
        {
            if(!this.pointer.isDown)
            {       
                this.column = Math.floor(this.x / this.tileSize);
                this.row = Math.floor(this.y / this.tileSize);
                this.x = (this.column * this.tileSize) + this.tileSize / 2;
                this.y = (this.row * this.tileSize) + this.tileSize / 2;
            }
        }
    }

    ReturnTile()
    {
        let tile = {column: this.column, row: this.row}

        return tile;
    }

    ReturnOrientation()
    {
        let orientation = {First: this.orientation1 , Second: this.orientation2}
        return orientation;
    }

    ChangeState(state) 
    {
        this.state = state;
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

    OnDrag(dragging){
     console.log(dragging);
     return dragging;
   }
}