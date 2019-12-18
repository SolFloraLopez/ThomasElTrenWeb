import EndMenu from './endMenu.js'
import Train, * as train from './train.js'
import Rail, * as rail from './Rail.js'
import Collectible, * as collectible from './collectible.js'
import Water, * as water from './water.js'
import Wagon from './wagon.js'
import Inventory, * as inventory from './inventory.js'
import {directionEnum, matrixEnum, stateEnum} from './Enums.js'

const TILE_SIZE = 50;
const COLUMNS = 28;
const ROWS = 16;
const POOL_LENGTH = 12; //Siempre par
const INITIAL_TRAIN_SPEED = 4;
const SPEED_INCREASE = 0.8;
const WATER_SLOTS = 7;

export default class Game extends Phaser.Scene {
  constructor(level) {
    super({ key: 'main' });
    this.level = level;
    this.inventory;
    this.score = 0;
    this.scoreText;
    this.state = stateEnum.ONTRACK;
    this.currentSpeed = INITIAL_TRAIN_SPEED;
    this.railPool = [];

    this.train;
    this.wagonsArray = [];
    this.wagonSpacer = 100;
    this.minSpacer = 30;
    this.aestheticRails = [];
  }

  preload()
  {
    this.load.tilemapTiledJSON('tilemap1','tilemaps/tilemap1.json');
    this.load.tilemapTiledJSON('tilemap2','tilemaps/tilemap2.json');
    this.load.tilemapTiledJSON('tilemap3','tilemaps/tilemap3.json');
    this.load.image('patronesTilemap1','img/terrain1.png');
    this.load.image('patronesTilemap2','img/terrain2.png');
    this.load.image('patronesTilemap3','img/terrain3.png');
    this.load.image('railsprite', 'img/rail.png', {frameWidth: 32, frameHeight: 48})
    this.load.image('bridgerailsprite', 'img/bridgeRail.png', {frameWidth: 32, frameHeight: 48})

    this.load.image('trainsprite', 'img/train.png', { frameWidth: 50, frameHeight: 50 })
    this.load.image('wagonsprite', 'img/wagon.png', { frameWidth: 50, frameHeight: 50 })

    this.load.image('passengersprite', 'img/passenger.png', { frameWidth: 50, frameHeight: 50 })
    this.load.image('boxsprite', 'img/box.png', { frameWidth: 50, frameHeight: 50 })
    this.load.image('watersprite', 'img/water.png', { frameWidth: 50, frameHeight: 50 })

    this.load.image('curvedrailsprite', 'img/curvedrail.png', {frameWidth: 32, frameHeight: 32})

    this.load.audio('button', ['soundFiles/buttonSound.mp3', 'soundFiles/buttonSound.ogg']);
    this.load.audio('music', ['soundFiles/music.mp3', 'soundFiles/music.ogg']);
  }

  create()
  {

    this.map = this.make.tilemap({
      key: 'tilemap'+this.level,
      tileWidth: 64,
      tileHeight: 64
    });


    this.r = this.input.keyboard.addKey('R');
    this.esc = this.input.keyboard.addKey('ESC');

    this.map.addTilesetImage('terrain'+this.level,'patronesTilemap'+this.level);
    //crea capa con tileset "terrain"
    this.backgroundLayer = this.map.createStaticLayer('Background','terrain'+this.level);
    //se añade colision a las partes que tengan atributo collides == true
    this.backgroundLayer.setCollisionByProperty({collides: true});
    this.physics.world.setBounds(0, 0, 1400, 800);
    this.scoreText = this.add.text(1155, 15, 'Puntos: 0', { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' ,fontSize: '35px'});
    
    //para ver la caja de colisiones del layer
    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // this.backgroundLayer.renderDebug(debugGraphics, {
    // tileColor: null, // Color of non-colliding tiles
    // collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    // faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });

    //grupos de colisiones
    this.railsGroup = this.physics.add.group();
    // this.trainsGroup = this.physics.add.group();
    this.passengersGroup = this.physics.add.group();
    this.boxsGroup = this.physics.add.group();
    this.waterGroup = this.physics.add.group();
    this.wagonsGroup = this.physics.add.group();
    //crea las entidades (los pasajeros seran un array tambien)
    this.passenger = new Collectible(this, 11, 9, 'passengersprite');

    this.buttonSound = this.sound.add('button');
    this.music = this.sound.add('music', {volume: 0.2}, {loop: true});
    //Crea agua en el mapa
    for(let i=0;i<WATER_SLOTS;i++) this.createWater();
    //Inicia el tren
    this.train = new Train(this, 11 * TILE_SIZE + TILE_SIZE / 2, 15 * TILE_SIZE + TILE_SIZE / 2, 'trainsprite', INITIAL_TRAIN_SPEED, directionEnum.UP);
    //Inicia el primer vagon
      this.wagonsArray[0] = new Wagon(this,this.train,this.wagonSpacer, this.minSpacer, 11 * TILE_SIZE + TILE_SIZE / 2, 16 * TILE_SIZE + TILE_SIZE / 2, 'wagonsprite');
    // for (var i = 0; i <= this.wagonsNum * this.wagonSpacer; i++)
    // {
    //   this.wagonPath[i] = new Phaser.Geom.Point(this.train.x, this.train.y);
    // }
    //se añaden a los grupos de colisiones
    this.passengersGroup.add(this.passenger);
    // this.trainsGroup.add(this.train);
    // this.trainsGroup.add(this.wagonsArray[1]);

    //creacion de colisiones entre entidades, y callbacks
    this.physics.add.collider(this.train, this.passengersGroup, (o1, o2) => {
      o2.destroy();
      this.changeWagonSpacer();
      this.createNewWagon();
      this.createPassenger();
      let rnd = Math.round(Math.random() * 10);
      if(rnd>=7) this.createBox();
      this.currentSpeed += SPEED_INCREASE;
      rnd = Math.round(Math.random() * 10);
      if(rnd<=7) this.inventory.ModifyRailCounter(1, 'A');
      this.score+=10;
      this.scoreText.setText('Puntos: '+ this.score);
      this.changeTrainSpeed();
    });
    this.physics.add.collider(this.train, this.boxsGroup, (o1, o2) => {
      o2.destroy();
      let rnd = Math.round(Math.random() * 10);
      if(rnd>=5){
        this.inventory.ModifyRailCounter(1,'B');
      }
      else {
        this.score+=10;
        this.scoreText.setText('Puntos: '+ this.score);
      }

    });
    this.physics.add.collider(this.train, this.wagonsGroup, (o1, o2) => {
      this.EndGame();
    });
    this.physics.add.overlap(this.train, this.waterGroup, (o1,o2) => {
      if(!o2.avoidable) this.EndGame();
    });

    this.physics.add.overlap(this.passengersGroup, this.backgroundLayer, (o1,o2) => {
      if(o2.collides){
        o1.destroy();
        this.createPassenger();
      }
    });
    this.physics.add.overlap(this.boxsGroup, this.backgroundLayer, (o1,o2) => {
      if(o2.collides){
        o1.destroy();
       this.createBox();
      }
    });
    this.physics.add.overlap(this.waterGroup, this.backgroundLayer, (o1,o2) => {
      if(o2.collides){
        o1.destroy();
        this.createWater();
      }

    });
    this.physics.add.collider(this.train, this.backgroundLayer, () => {
      this.EndGame();
    });

    this.input.on('pointerdown', (pointer)=>{
      let pointerC = Math.floor((pointer.x/TILE_SIZE));
      let pointerR = Math.floor((pointer.y/TILE_SIZE))
      let pointerPos = {column: pointerC,row: pointerR};
      let objectReturned = this.SearchWater(pointerPos);
      if(objectReturned.found && objectReturned.water.avoidable){
        objectReturned.water.SetAvoidable(false);
      }
    });

    this.esc.on('up',()=>{
      this.scene.launch('pause');
      this.scene.pause(this);
    });


    this.inventory = new Inventory(this,(POOL_LENGTH/2)-1);
    for(let i = 0; i < POOL_LENGTH; i++)
    {
      //el tipo de rail definira su angulo
      let railType = 4 * (i % 2);
      
      if (railType == 0) {
        this.railPool[i] = new Rail(this, 24, 8, 'curvedrailsprite', this.input.activePointer, railType, TILE_SIZE,this.inventory);

      }
      else {
        this.railPool[i] = new Rail(this, 26, 8, 'bridgerailsprite', this.input.activePointer, railType, TILE_SIZE,this.inventory);

      }
      
      //ademas de crearlos se añaden al grupo de colisiones
      this.railsGroup.add(this.railPool[i]);

    }

    this.music.play();

  }
  update()
  {
    // console.log(this.train.x-this.wagonsArray[1].x);
    // console.log(this.train.y-this.wagonsArray[1].y);
    //Nota: como ya no se puede comprobar la posición exacta del tren con el rail para cambiar la direccion (porque con las fisicas se salta frames) hay que poner un pequeño offset en las comprobaciones
    //y abarcar todos los casos en Compatible();
    //si se superponen trenes y railes
    if(this.Exit()){
      this.EndGame();
    }
    this.physics.overlap(this.train,this.railsGroup,(o1, o2) => {
      //comprueba si el rail es compatible con el tren, es decir, si puede entrar por ese lado del rail
      if(!o1.Compatible(o2)) this.EndGame();
    });
    

    this.CheckAestheticRails();
  }
  createNewWagon()
  {
    this.wagonsArray[this.wagonsArray.length] = new Wagon(this,this.wagonsArray[this.wagonsArray.length-1],this.wagonSpacer,this.minSpacer,this.wagonsArray[this.wagonsArray.length-1].x,this.wagonsArray[this.wagonsArray.length-1].y,'wagonsprite');
    this.wagonsGroup.add(this.wagonsArray[this.wagonsArray.length-1]);
  }

  createPassenger()
  {
    let tile = {column: Math.floor(Math.random() * (COLUMNS-5)), row: Math.floor(Math.random() * ROWS)};
    this.passenger = new Collectible(this, tile.column, tile.row, 'passengersprite');
    this.passengersGroup.add(this.passenger);
  }
  createBox()
  {
    let tile = {column: Math.floor(Math.random() * (COLUMNS-5)), row: Math.floor(Math.random() * ROWS)};
    this.box = new Collectible(this, tile.column, tile.row, 'boxsprite');
    this.boxsGroup.add(this.box);
  }
  createWater(){
    let tile;
    //con este do, se evita que se cree agua debajo del tren y deja margen para que avance
    do{
       tile = {column: Math.floor(Math.random() * (COLUMNS-5)), row: Math.floor(Math.random() * ROWS)};
    }while(tile.column==11 && tile.row>=12);
    this.water = new Water(this, tile.column, tile.row, 'watersprite');
    this.waterGroup.add(this.water);
  }

  changeTrainSpeed()
  {
    this.train.ChangeSpeed(this.currentSpeed);
  }

  changeWagonSpacer()
  {
    this.wagonSpacer -= SPEED_INCREASE * 10;
    if(this.wagonSpacer < this.minSpacer) this.wagonSpacer = this.minSpacer;

    for(let i = 0; i < this.wagonsArray.length; i++)
    {
      this.wagonsArray[i].updateCounter(SPEED_INCREASE * 10);
    }
  }
  //si quedan 2 railes de un tipo en el inventario, genera nuevos.
  CreateRail(){
    let counters = this.CheckRails();
    if(counters.curvedRails<=1){
      let rail =  new Rail(this, 24, 8, 'curvedrailsprite', this.input.activePointer, 0, TILE_SIZE,this.inventory)
      this.railPool[this.railPool.length] =rail;
      this.railsGroup.add(rail);
    }
    if (counters.straightRails<=1){
      let rail =  new Rail(this, 26, 8, 'bridgerailsprite', this.input.activePointer, 4, TILE_SIZE,this.inventory)
      this.railPool[this.railPool.length] = rail;
      this.railsGroup.add(rail);
    }
    
  }

  CheckRails(){
    let counters={curvedRails:0,straightRails:0};
    for(let i = 0; i < this.railPool.length; i++)
    {
      let tile = this.railPool[i].ReturnTile();
      if(this.railPool[i].ReturnRailType()===0 && tile.column === 24){counters.curvedRails++;}
      else if(this.railPool[i].ReturnRailType()===4 && tile.column === 26){counters.straightRails++;}
    }
    return counters;
  }

  CheckAestheticRails()
  {
    let flag = false;
    let aestheticRailTile;
    let trainHeadTile = this.train.ReturnTile();

    this.AestheticRailsCreation(flag, aestheticRailTile, trainHeadTile);

    flag = false;
    aestheticRailTile = {column: Math.floor(this.aestheticRails[0].getCenter().x / TILE_SIZE), row: Math.floor(this.aestheticRails[0].getCenter().y / TILE_SIZE) }
    this.AestheticRailsDestruction(flag, aestheticRailTile, trainHeadTile);
  }

  AestheticRailsCreation(flag, aestheticRailTile, trainHeadTile)
  {
    let i = 0;
    let trainHeadDir = this.train.ReturnDirection();

    if(this.aestheticRails.length > 0) 
    {   
      aestheticRailTile = {column: Math.floor(this.aestheticRails[this.aestheticRails.length - 1].getCenter().x / TILE_SIZE), 
      row: Math.floor(this.aestheticRails[this.aestheticRails.length - 1].getCenter().y / TILE_SIZE) }

      if (aestheticRailTile.column === trainHeadTile.column && aestheticRailTile.row === trainHeadTile.row) flag = true;

      while(!flag && i < this.railPool.length) 
      {
        let curvedRailTile = this.railPool[i].ReturnTile();
        if (aestheticRailTile.column === curvedRailTile.column && aestheticRailTile.row === curvedRailTile.row) flag = true;
        i++;
      }
    }

    if(!flag)
    {
      this.aestheticRails[this.aestheticRails.length] = this.add.sprite(trainHeadTile.column * TILE_SIZE + TILE_SIZE / 2, trainHeadTile.row * TILE_SIZE + TILE_SIZE / 2, 'railsprite');
      if(trainHeadDir % 2 !== 0) this.aestheticRails[this.aestheticRails.length - 1].setAngle(90);
    } 
  }

  AestheticRailsDestruction(flag, aestheticRailTile, trainHeadTile)
  {
    let i = 1;

    while(!flag && i < this.wagonsArray.length) 
    {
      trainHeadTile = this.wagonsArray[i].ReturnTile();
      if (aestheticRailTile.column === trainHeadTile.column && aestheticRailTile.row === trainHeadTile.row) flag = true;
      i++;
    }

    if(!flag)
    {
      this.aestheticRails[0].destroy();
      this.aestheticRails.shift();
    }

    i = 0;
    
    while(flag && i < this.railPool.length) 
    {
      let curvedRailTile = this.railPool[i].ReturnTile();
      if (aestheticRailTile.column === curvedRailTile.column && aestheticRailTile.row === curvedRailTile.row)
      {
        this.aestheticRails[0].destroy();
        this.aestheticRails.shift();
        flag = false;
      }
      i++;
    }
  }

  Exit(){
    let pos;
    pos = this.train.ReturnPos();
    if(pos.x < TILE_SIZE/3 || pos.y < TILE_SIZE/3 || pos.y > (TILE_SIZE * ROWS)-TILE_SIZE/3) return true;
  }
  SearchWater(pointerPos){
    let waterArray = this.waterGroup.getChildren();
    let found = false;
    let waterFound;
    for (let i = 0;i<waterArray.length && !found;i++){
      if(waterArray[i].column === pointerPos.column && waterArray[i].row === pointerPos.row) {
        found = true;
        waterFound = waterArray[i];
      }
    }
    let returnObject = {found: found,water: waterFound};
    return returnObject;

  }
  EndGame(){
    this.music.stop();
    this.scene.pause(this);
    let endScene = this.scene.get('end');
    if(endScene===null){
      this.scene.add('end',new EndMenu(this.score));
      this.scene.launch('end');
    }
  }
  // changeState(state)
  // {
  //   this.state = state;

  //   for(let i = 0; i < POOL_LENGTH; i++)
  //   {
  //     this.railPool[i].ChangeState(state);
  //   }

  //   for(let i = 0; i < this.trainArray.length; i++)
  //   {
  //     this.trainArray[i].ChangeState(state);
  //   }
  // }
}
