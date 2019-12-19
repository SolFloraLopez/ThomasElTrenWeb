import EndMenu from './endMenu.js'
import Train from './train.js'
import Rail from './Rail.js'
import Collectible from './collectible.js'
import Water from './water.js'
import Wagon from './wagon.js'
import Inventory from './inventory.js'
import {directionEnum} from './Enums.js'

const TILE_SIZE = 50;
const COLUMNS = 28;
const ROWS = 16;
const TOTAL_RAILS = 12;
const INITIAL_TRAIN_SPEED = 4;
const SPEED_INCREASE = 0.8;
const WATER_SLOTS = 7;

export default class Game extends Phaser.Scene {
  constructor(level) {
    super({ key: 'main' });
    this.level = level;
    this.train;
    this.trainCurrentSpeed = INITIAL_TRAIN_SPEED;
    this.score = 0;
    this.scoreText;
    this.inventory;

    this.railsPool = [];
    this.aestheticRails = [];
    this.wagonsPool = [];

    this.wagonSpacer = 160;
    this.minSpacer = 30;
  }

  preload()
  {
    this.load.tilemapTiledJSON('tilemap1','tilemaps/tilemap1.json');
    this.load.tilemapTiledJSON('tilemap2','tilemaps/tilemap2.json');
    this.load.tilemapTiledJSON('tilemap3','tilemaps/tilemap3.json');
    this.load.image('patronesTilemap1','img/terrain1.png');
    this.load.image('patronesTilemap2','img/terrain2.png');
    this.load.image('patronesTilemap3','img/terrain3.png');
    
    this.load.image('trainsprite', 'img/train.png', { frameWidth: 50, frameHeight: 50 });
    this.load.image('wagonsprite', 'img/wagon.png', { frameWidth: 50, frameHeight: 50 });

    this.load.image('railsprite', 'img/rail.png', {frameWidth: 32, frameHeight: 48});
    this.load.image('curvedrailsprite', 'img/curvedrail.png', {frameWidth: 32, frameHeight: 32});
    this.load.image('bridgerailsprite', 'img/bridgeRail.png', {frameWidth: 32, frameHeight: 48});

    this.load.image('passengersprite', 'img/passenger.png', { frameWidth: 50, frameHeight: 50 });
    this.load.image('boxsprite', 'img/box.png', { frameWidth: 50, frameHeight: 50 });
    this.load.image('watersprite', 'img/water.png', { frameWidth: 50, frameHeight: 50 });
    
    this.load.audio('crashSound', ['soundFiles/crashSound.mp3', 'soundFiles/crashSound.ogg']);
    this.load.audio('dragObject', ['soundFiles/dragObject.mp3', 'soundFiles/dragObject.ogg']);
    this.load.audio('dropObject', ['soundFiles/dropObject.mp3', 'soundFiles/dropObject.ogg']);
    this.load.audio('pickBox', ['soundFiles/pickBox.mp3', 'soundFiles/pickBox.ogg']);
    this.load.audio('pickPassenger', ['soundFiles/pickPassenger.mp3', 'soundFiles/pickPassenger.ogg']);
    this.load.audio('rotateObject', ['soundFiles/rotateObject.mp3', 'soundFiles/rotateObject.ogg']);
  }

  create()
  {
    this.music = this.sound.add('music'+this.level);
    this.music.setLoop(true);
    this.music.setVolume(0.2);
    this.music.play();
    console.log(this.music);
    //INPUTS de teclado
    this.r = this.input.keyboard.addKey('R');
    this.esc = this.input.keyboard.addKey('ESC');
    //creación de mapa con tilemap
    this.map = this.make.tilemap({
      key: 'tilemap'+this.level,
      tileWidth: 64,
      tileHeight: 64
    });
    this.map.addTilesetImage('terrain'+this.level,'patronesTilemap'+this.level);
    //crea capa con tileset "terrain" de nivel correspondiente
    this.backgroundLayer = this.map.createStaticLayer('Background','terrain'+this.level);
    //se añade colision a las partes que tengan atributo collides == true
    this.backgroundLayer.setCollisionByProperty({collides: true});

    //se añade el texto de puntuación
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
    this.wagonsGroup = this.physics.add.group();
    this.passengersGroup = this.physics.add.group();
    this.boxsGroup = this.physics.add.group();
    this.waterGroup = this.physics.add.group();

    //inicia el tren
    this.train = new Train(this, 11 * TILE_SIZE + TILE_SIZE / 2, 15 * TILE_SIZE + TILE_SIZE / 2, 'trainsprite', INITIAL_TRAIN_SPEED, directionEnum.UP);
    //inicia el primer vagon y el primer pasajero
    this.wagonsPool[0] = new Wagon(this,this.train,this.wagonSpacer, this.minSpacer, 11 * TILE_SIZE + TILE_SIZE / 2, 16 * TILE_SIZE + TILE_SIZE / 2, 'wagonsprite');
    let passenger = new Collectible(this, 11, 9, 'passengersprite');
    //se añade el pasajero a su grupo de colisiones
    this.passengersGroup.add(passenger);

     //creación de inventario
     this.inventory = new Inventory(this,(TOTAL_RAILS/2)-1);
     //generación de raíles iniciales
     for(let i = 0; i < TOTAL_RAILS; i++)
     {
       //el tipo de rail definira su angulo
       let railType = 4 * (i % 2);
       if (railType == 0) this.railsPool[i] = new Rail(this, 24, 8, 'curvedrailsprite', this.input.activePointer, railType, TILE_SIZE,this.inventory);
       else this.railsPool[i] = new Rail(this, 26, 8, 'bridgerailsprite', this.input.activePointer, railType, TILE_SIZE,this.inventory);
       //ademas de crearlos se añaden al grupo de colisiones
        this.railsGroup.add(this.railsPool[i]);
     }
    //crea huecos de agua en el mapa
    for(let i=0;i<WATER_SLOTS;i++) this.createWater();

    //creacion de colisiones entre entidades, y callbacks
    this.physics.add.collider(this.train, this.passengersGroup, (o1, o2) => {
      this.sound.play('pickPassenger');
      o2.destroy();
      this.changeWagonSpacer();
      this.createWagon();
      this.createPassenger();

      //probabilidad de que al recoger un pasajero, aparezca un paquete
      let rnd = Math.round(Math.random() * 10);
      if(rnd>=7)
      {
        this.createBox();
      } 
      //probabilidad de que al recoger un pasajero, se añada un raíl curvo al inventario
      rnd = Math.round(Math.random() * 10);
      if(rnd<=7) this.inventory.ModifyRailCounter(1, 'A');
      
      this.trainCurrentSpeed += SPEED_INCREASE;
      this.changeTrainSpeed();
      this.score+=10;
      this.scoreText.setText('Puntos: '+ this.score);
    });

    this.physics.add.collider(this.train, this.boxsGroup, (o1, o2) => {
      this.sound.play('pickBox');
      o2.destroy();
      //probabilidad de que al recoger una caja, se añada un raíl puente al inventario o se añadan 10 puntos al marcador
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

    //si se crean pasajeros, paquetes o agua encima de un obstáculo, se elimina y se vuelve a crear.
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

    //fin del juego si el tren choca con un obstáculo o entra por un raíl incompatible
    this.physics.add.overlap(this.train, this.waterGroup, (o1,o2) => {
      if(!o2.avoidable) this.EndGame();
    });
    this.physics.add.collider(this.train, this.backgroundLayer, () => {
      this.EndGame();
    });
    this.physics.add.overlap(this.train,this.railsGroup,(o1, o2) => {
      //comprueba si el rail es compatible con el tren, es decir, si puede entrar por ese lado del rail
      if(!o1.Compatible(o2)) this.EndGame();
    });

    //acciones de input
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
  }
  update()
  {
    if(this.Exit()) this.EndGame();
    this.CheckAestheticRails();
  }

  createWagon()
  {
    this.wagonsPool[this.wagonsPool.length] = new Wagon(this,this.wagonsPool[this.wagonsPool.length-1],this.wagonSpacer,this.minSpacer,this.wagonsPool[this.wagonsPool.length-1].x,this.wagonsPool[this.wagonsPool.length-1].y,'wagonsprite');
    this.wagonsGroup.add(this.wagonsPool[this.wagonsPool.length-1]);
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
    //con este do-while, se evita que se cree agua debajo del tren y deja margen para que avance
    do{
       tile = {column: Math.floor(Math.random() * (COLUMNS-5)), row: Math.floor(Math.random() * ROWS)};
    }while(tile.column==11 && tile.row>=12);
    this.water = new Water(this, tile.column, tile.row, 'watersprite');
    this.waterGroup.add(this.water);
  }

  changeTrainSpeed()
  {
    this.train.ChangeSpeed(this.trainCurrentSpeed);
  }

  changeWagonSpacer()
  {
    this.wagonSpacer -= SPEED_INCREASE * 10;
    if(this.wagonSpacer < this.minSpacer) this.wagonSpacer = this.minSpacer;

    for(let i = 0; i < this.wagonsPool.length; i++)
    {
      this.wagonsPool[i].updateCounter(SPEED_INCREASE * 10);
    }
  }
  //si quedan 2 railes de un tipo en el inventario, genera nuevos.
  CreateRail(){
    let counters = this.CheckRails();
    if(counters.curvedRails<=1){
      let rail =  new Rail(this, 24, 8, 'curvedrailsprite', this.input.activePointer, 0, TILE_SIZE,this.inventory)
      this.railsPool[this.railsPool.length] =rail;
      this.railsGroup.add(rail);
    }
    if (counters.straightRails<=1){
      let rail =  new Rail(this, 26, 8, 'bridgerailsprite', this.input.activePointer, 4, TILE_SIZE,this.inventory)
      this.railsPool[this.railsPool.length] = rail;
      this.railsGroup.add(rail);
    }
    
  }

  CheckRails(){
    let counters={curvedRails:0,straightRails:0};
    for(let i = 0; i < this.railsPool.length; i++)
    {
      let tile = this.railsPool[i].ReturnTile();
      if(this.railsPool[i].ReturnRailType()===0 && tile.column === 24){counters.curvedRails++;}
      else if(this.railsPool[i].ReturnRailType()===4 && tile.column === 26){counters.straightRails++;}
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

      while(!flag && i < this.railsPool.length) 
      {
        let curvedRailTile = this.railsPool[i].ReturnTile();
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

    while(!flag && i < this.wagonsPool.length) 
    {
      trainHeadTile = this.wagonsPool[i].ReturnTile();
      if (aestheticRailTile.column === trainHeadTile.column && aestheticRailTile.row === trainHeadTile.row) flag = true;
      i++;
    }

    if(!flag)
    {
      this.aestheticRails[0].destroy();
      this.aestheticRails.shift();
    }

    i = 0;
    
    while(flag && i < this.railsPool.length) 
    {
      let curvedRailTile = this.railsPool[i].ReturnTile();
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
    this.sound.play('crashSound');
    this.music.stop();
    this.scene.pause(this);
    let endScene = this.scene.get('end');
    if(endScene===null){
      this.scene.add('end',new EndMenu(this.score));
      this.scene.launch('end');
    }
  }
  MuteMusic(bool){
    this.music.setMute(bool);
  }
  MuteSound(bool){
    this.sound.setMute(bool);
  }
  DestroyMusic(){
    this.music.destroy();
  }

}
