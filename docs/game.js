import Train from './train.js'
import Wagon from './wagon.js'
import Rail from './Rail.js'
import Collectible from './collectible.js'
import Water from './water.js'
import Inventory from './inventory.js'
import EndMenu from './endMenu.js'
import {directionEnum} from './Enums.js'

const TILE_SIZE = 50;
const COLUMNS = 28;
const ROWS = 16;
const TOTAL_RAILS = 12;
const INITIAL_TRAIN_SPEED = 30;
const SPEED_INCREASE = 4;
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
    this.wagonsPool = [];

    this.wagonSpacer = 160;
    this.spacerUpdateTime = 0.01;
  }

  preload()
  {
    this.load.tilemapTiledJSON('tilemap'+this.level,'tilemaps/tilemap'+this.level+'.json');
    this.load.image('patronesTilemap'+this.level,'img/terrain'+this.level+'.png');
    this.load.image('R','img/R.png');
    
    this.load.image('trainsprite', 'img/train.png', { frameWidth: 50, frameHeight: 50 });
    this.load.image('wagonsprite', 'img/wagon.png', { frameWidth: 50, frameHeight: 50 });

    this.load.image('railsprite', 'img/rail.png', {frameWidth: 32, frameHeight: 48});
    this.load.image('curvedrailsprite', 'img/curvedrail.png', {frameWidth: 32, frameHeight: 32});
    this.load.image('bridgerailsprite', 'img/bridgeRail.png', {frameWidth: 32, frameHeight: 48});

    this.load.image('passengersprite', 'img/passenger.png', { frameWidth: 50, frameHeight: 50 });
    this.load.image('boxsprite', 'img/box.png', { frameWidth: 50, frameHeight: 50 });
    this.load.image('watersprite', 'img/water.png', { frameWidth: 50, frameHeight: 50 });
    
    this.load.audio('music'+this.level, ['soundFiles/music'+this.level+'.mp3', 'soundFiles/music'+this.level+'.ogg']);
    this.load.audio('crashSound', ['soundFiles/crashSound.mp3', 'soundFiles/crashSound.ogg']);
    this.load.audio('dragObject', ['soundFiles/dragObject.mp3', 'soundFiles/dragObject.ogg']);
    this.load.audio('dropObject', ['soundFiles/dropObject.mp3', 'soundFiles/dropObject.ogg']);
    this.load.audio('pickBox', ['soundFiles/pickBox.mp3', 'soundFiles/pickBox.ogg']);
    this.load.audio('pickPassenger', ['soundFiles/pickPassenger.mp3', 'soundFiles/pickPassenger.ogg']);
    this.load.audio('rotateObject', ['soundFiles/rotateObject.mp3', 'soundFiles/rotateObject.ogg']);
    this.load.audio('error', ['soundFiles/error.mp3', 'soundFiles/error.ogg']);

    this.LoadScreen();

  }

  create()
  {
    //música de nivel
    this.music = this.sound.add('music'+this.level);
    this.music.setLoop(true);
    this.music.setVolume(0.2);
    this.music.play();
    //INPUTS de teclado
    this.r = this.input.keyboard.addKey('R');
    this.add.image(1320,340,'R').setDepth(1);
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
    //se añade colision a las partes que tengan atributo collides === true
    this.backgroundLayer.setCollisionByProperty({collides: true});

    //se añade el texto de puntuación
    this.scoreText = this.add.text(1155, 15, 'Puntos: 0', { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' ,fontSize: '35px', fill: '#00c4ef'});

    //grupos para colisiones
    this.railsGroup = this.physics.add.group();
    this.wagonsGroup = this.physics.add.group();
    this.passengersGroup = this.physics.add.group();
    this.boxsGroup = this.physics.add.group();
    this.waterGroup = this.physics.add.group();

    //inicia el tren
    this.train = new Train(this, 11, 15, 'trainsprite', TILE_SIZE, INITIAL_TRAIN_SPEED, directionEnum.UP);
    //inicia el primer vagon y el primer pasajero
    this.wagonsPool[0] = new Wagon(this,this.train, this.wagonSpacer, this.spacerUpdateTime, 11, 16, 'wagonsprite',TILE_SIZE);
    let passenger = new Collectible(this, 11, 9, 'passengersprite',TILE_SIZE);
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
      //this.changeWagonSpacer();
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
    this.physics.add.overlap(this.train, this.backgroundLayer, (o1,o2) => {
      if(o2.collides){
      this.EndGame();
      }
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
  }

  createWagon()
  {
    let tile = this.wagonsPool[this.wagonsPool.length-1].ReturnTile();
    this.wagonsPool[this.wagonsPool.length] = new Wagon(this,this.wagonsPool[this.wagonsPool.length-1],this.wagonSpacer, this.spacerUpdateTime, tile.column,tile.row,'wagonsprite', TILE_SIZE);
    this.wagonsGroup.add(this.wagonsPool[this.wagonsPool.length-1]);
  }

  createPassenger()
  {
    let tile = {column: Math.floor(Math.random() * (COLUMNS-5)), row: Math.floor(Math.random() * ROWS)};
    this.passenger = new Collectible(this, tile.column, tile.row, 'passengersprite', TILE_SIZE);
    this.passengersGroup.add(this.passenger);
  }
  createBox()
  {
    let tile = {column: Math.floor(Math.random() * (COLUMNS-5)), row: Math.floor(Math.random() * ROWS)};
    let box = new Collectible(this, tile.column, tile.row, 'boxsprite', TILE_SIZE);
    this.boxsGroup.add(box);
  }
  createWater(){
    let tile;
    //con este do-while, se evita que se cree agua debajo del tren y deja margen para que avance
    do{
       tile = {column: Math.floor(Math.random() * (COLUMNS-5)), row: Math.floor(Math.random() * ROWS)};
    }while(tile.column==11 && tile.row>=12);
    let water = new Water(this, tile.column, tile.row, 'watersprite', TILE_SIZE);
    this.waterGroup.add(water);
  }

  changeTrainSpeed()
  {
    this.train.ChangeSpeed(this.trainCurrentSpeed);
  }
  
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
    let counters = {curvedRails:0,straightRails:0};
    for(let i = 0; i < this.railsPool.length; i++)
    {
      let tile = this.railsPool[i].ReturnTile();
      if(this.railsPool[i].ReturnRailType()===0 && tile.column === 24){counters.curvedRails++;}
      else if(this.railsPool[i].ReturnRailType()===4 && tile.column === 26){counters.straightRails++;}
    }
    return counters;
  }

  //Método para comprobar si el tren sale del mapa
  Exit(){
    let pos;
    pos = this.train.ReturnPos();
    if(pos.x < TILE_SIZE/3 || pos.y < TILE_SIZE/3 || pos.y > (TILE_SIZE * ROWS)-TILE_SIZE/3) return true;
  }
  //Busca si hay agua en la posición del cursor
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
  //Termina el juego
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
  LoadScreen(){
    let background = this.add.graphics({fillStyle: {color: '0x2e3673'}});

    let percText = this.add.text(470, 100, '0%', { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' ,fontSize: '160px', fill: '#00c4ef'});

    let loadingBar = this.add.graphics({fillStyle: {color: '0x00c4ef'}});

    this.load.on('start',(percent)=>{
      background.fillRect(20,20,this.game.renderer.width*0.97,this.game.renderer.height*0.95);
    });

    this.load.on('progress',(percent)=>{
      percText.setText(Math.round(percent*100)+'%');
      loadingBar.fillRect(20,this.game.renderer.height/2,(this.game.renderer.width * percent)*0.97,200);
    });
  }

}
