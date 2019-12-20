import Game from './game.js'

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'menu' });
  }

  preload()
  {
    this.load.image('menuBG', 'img/MenuBG.png');
    this.load.image('playBtn', 'img/PlayBtn.png');
    this.load.image('infoBtn', 'img/InfoBtn.png');
    this.load.image('menuBtn', 'img/MainMenuBtn.png');
    this.load.image('playlockedBtn', 'img/PlayLockedBtn.png');
    this.load.image('fW', 'img/framework.png');
    this.load.image('level1', 'img/plainLevel.png');
    this.load.image('level2', 'img/snowLevel.png');
    this.load.image('level3', 'img/desertLevel.png');
    this.load.image('lock', 'img/lock.png');
    this.load.image('credits', 'img/credits.png');
    this.load.image('musicOffBtn', 'img/musicOffBtn.png');
    this.load.image('musicOnBtn', 'img/musicOnBtn.png');
    this.load.image('soundOffBtn', 'img/soundOffBtn.png');
    this.load.image('soundOnBtn', 'img/soundOnBtn.png');
    this.load.image('tableBtn', 'img/tableBtn.png');
    
    this.load.audio('button', ['soundFiles/buttonSound.mp3', 'soundFiles/buttonSound.ogg']);
    this.load.audio('buttonHover', ['soundFiles/buttonHoverSound.mp3', 'soundFiles/buttonHoverSound.ogg']);
    this.load.audio('music', ['soundFiles/music.mp3', 'soundFiles/music.ogg']);
  }

  create()
  {
    this.music = this.sound.add('music');
    this.music.setLoop(true);
    this.music.setVolume(0.2);
    this.music.play();

    this.levelSelected=0;

    this.add.image(0,0,'menuBG').setOrigin(0);

    //Botones del menú
    let lvl1Btn =  this.add.image(130,310,'level1').setOrigin(0);
    let lvl2Btn =  this.add.image(540,310,'level2').setOrigin(0);
    let lvl3Btn =  this.add.image(950,310,'level3').setOrigin(0);
    let playBtn = this.add.image(420,640,'playBtn').setOrigin(0);
    this.playLockedBtn = this.add.image(420,640,'playlockedBtn').setOrigin(0);
    let infoBtn = this.add.image(1030,640,'infoBtn').setOrigin(0);
    let menuBtn = this.add.image(415,580,'menuBtn').setOrigin(0);
    let musicBtn =  this.add.image(40,660,'musicOffBtn').setOrigin(0);
    this.add.image(40,660,'musicOnBtn').setOrigin(0);
    let soundBtn =  this.add.image(160,660,'soundOnBtn').setOrigin(0);
    this.add.image(160,660,'soundOffBtn').setOrigin(0);
    let tableBtn =  this.add.image(280,660,'tableBtn').setOrigin(0);

    //Marcos para elegir nivel
    let framW = this.add.image(130,310,'fW').setOrigin(0);
    this.lock = this.add.image(130,310,'lock').setOrigin(0);
    this.lock.visible = false;

    //Imagen de los créditos
    this.credits = this.add.image(0,0,'credits').setOrigin(0);
    this.credits.setDepth(2);
    this.credits.setVisible(false);
    menuBtn.setVisible(false);
    menuBtn.setDepth(3);

    if(this.sound.mute) soundBtn.setDepth(-1);
    else soundBtn.setDepth(1);
    musicBtn.setDepth(-1);

    this.credits.setInteractive();
    playBtn.setInteractive();
    lvl1Btn.setInteractive();
    lvl2Btn.setInteractive();
    lvl3Btn.setInteractive();
    infoBtn.setInteractive();
    menuBtn.setInteractive();
    musicBtn.setInteractive();
    soundBtn.setInteractive();
    tableBtn.setInteractive();

    //Acciones de botones
    playBtn.on('pointerup',()=>{
      this.sound.play('button');
      if(this.levelSelected!=0 && !this.credits.visible){
        this.music.destroy();
        this.scene.add('main',new Game(this.levelSelected));
        this.scene.start('main');
      }
    });
    lvl1Btn.on('pointerover',()=>{
      framW.setPosition(lvl1Btn.x,lvl1Btn.y);
      this.sound.play('buttonHover');
    });
    lvl2Btn.on('pointerover',()=>{
      framW.setPosition(lvl2Btn.x,lvl2Btn.y);
      this.sound.play('buttonHover');
    });
    lvl3Btn.on('pointerover',()=>{
      framW.setPosition(lvl3Btn.x,lvl3Btn.y);
      this.sound.play('buttonHover');
    });

    lvl1Btn.on('pointerup',()=>{
      this.lock.setPosition(lvl1Btn.x,lvl1Btn.y);
      this.sound.play('button');
      this.LockLevel(1);
    });
    lvl2Btn.on('pointerup',()=>{
      this.lock.setPosition(lvl2Btn.x,lvl2Btn.y);
      this.sound.play('button');
      this.LockLevel(2);
    });
    lvl3Btn.on('pointerup',()=>{
      this.lock.setPosition(lvl3Btn.x,lvl3Btn.y);
      this.sound.play('button');
      this.LockLevel(3);
    });
    infoBtn.on('pointerup',()=>{
      this.sound.play('button');
      this.credits.setVisible(true);
      menuBtn.setVisible(true);
    });
    menuBtn.on('pointerup',()=>{
      this.sound.play('button');
      this.credits.setVisible(false);
      menuBtn.setVisible(false);
    });
    musicBtn.on('pointerup',()=>{
      this.sound.play('button');
      if (!this.music.mute){
        this.music.setMute(true);
        musicBtn.setDepth(1);
      }
      else{
        this.music.setMute(false);
        musicBtn.setDepth(-1);
      }
    });
    soundBtn.on('pointerup',()=>{
      this.sound.play('button');
      if (!this.sound.mute){
        this.sound.setMute(true);
        soundBtn.setDepth(-1);
      }
      else{
        this.sound.setMute(false);
        soundBtn.setDepth(1);
      }
    });
    tableBtn.on('pointerup',()=>{
      this.sound.play('button');
      this.scene.pause(this);
      this.scene.launch('leaderboard');
    });
  }

  //Método para fijar nivel
  LockLevel(level){
    this.levelSelected = level;
    this.lock.visible = true;
    this.playLockedBtn.destroy();
  }
  
}
