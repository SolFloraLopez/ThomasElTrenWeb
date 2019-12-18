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
  }

  create()
  {

    this.add.image(0,0,'menuBG').setOrigin(0);
    let lvl1Btn =  this.add.image(130,310,'level1').setOrigin(0);
    let lvl2Btn =  this.add.image(540,310,'level2').setOrigin(0);
    let lvl3Btn =  this.add.image(950,310,'level3').setOrigin(0);
    let framW = this.add.image(130,310,'fW').setOrigin(0);
    this.lock = this.add.image(130,310,'lock').setOrigin(0);
    this.lock.visible = false;
    this.levelSelected=0;




    let playButton = this.add.image(420,640,'playBtn').setOrigin(0);
    let infoButton = this.add.image(1030,640,'infoBtn').setOrigin(0);
    this.playLockedBtn = this.add.image(420,640,'playlockedBtn').setOrigin(0);
    playButton.setInteractive();
    lvl1Btn.setInteractive();
    lvl2Btn.setInteractive();
    lvl3Btn.setInteractive();

    playButton.on('pointerup',()=>{
      console.log(this.levelSelected);
      if(this.levelSelected!=0){
        this.scene.add('main',new Game(this.levelSelected));
        this.scene.start('main');
      }
    });
    lvl1Btn.on('pointerover',()=>{
      framW.setPosition(lvl1Btn.x,lvl1Btn.y);
    });
    lvl2Btn.on('pointerover',()=>{
      framW.setPosition(lvl2Btn.x,lvl2Btn.y);
    });
    lvl3Btn.on('pointerover',()=>{
      framW.setPosition(lvl3Btn.x,lvl3Btn.y);
    });

    lvl1Btn.on('pointerup',()=>{
      this.lock.setPosition(lvl1Btn.x,lvl1Btn.y);
      this.LockLevel(1);
    });
    lvl2Btn.on('pointerup',()=>{
      this.lock.setPosition(lvl2Btn.x,lvl2Btn.y);
      this.LockLevel(2);
    });
    lvl3Btn.on('pointerup',()=>{
      this.lock.setPosition(lvl3Btn.x,lvl3Btn.y);
      this.LockLevel(3);
    });
    infoButton.on('pointerup',()=>{

    });

  }
  LockLevel(level){
    this.levelSelected = level;
    this.lock.visible = true;
    this.playLockedBtn.destroy();
  }
  
}
