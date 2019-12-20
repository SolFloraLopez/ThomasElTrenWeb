
export default class PauseMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'pause' });
  }

  preload()
  {
    this.load.image('pauseBG', 'img/PauseBG.png');
    this.load.image('resumeBtn', 'img/ResumeBtn.png');
    this.load.image('mainMenuBtn', 'img/MainMenuBtn.png');
  }

  create()
  {
    this.scene.bringToTop(this);
    this.add.image(0,0,'pauseBG').setOrigin(0);

    //Botones de pausa
    let resumeButton = this.add.image(275,330,'resumeBtn').setOrigin(0);
    let menuButton = this.add.image(275,510,'mainMenuBtn').setOrigin(0);
    let musicBtn =  this.add.image(120,420,'musicOffBtn').setOrigin(0);
    this.add.image(120,420,'musicOnBtn').setOrigin(0);
    let soundBtn =  this.add.image(120,550,'soundOnBtn').setOrigin(0);
    this.add.image(120,550,'soundOffBtn').setOrigin(0);

    let gameScene = this.scene.get('main');

    if(!gameScene.music.mute)musicBtn.setDepth(-1);
    else musicBtn.setDepth(1);
    if(this.sound.mute) soundBtn.setDepth(-1);
    else soundBtn.setDepth(1);

    resumeButton.setInteractive();
    menuButton.setInteractive();
    musicBtn.setInteractive();
    soundBtn.setInteractive();

    //Acciones de los botones
    resumeButton.on('pointerup',()=>{
      this.sound.play('button');
      this.scene.resume('main');
      this.scene.stop(this);
    });
    menuButton.on('pointerup',()=>{
      this.sound.play('button');
      gameScene.DestroyMusic();
      this.scene.remove('main')
      this.scene.start('menu');
    });
    musicBtn.on('pointerup',()=>{
      this.sound.play('button');
      if (!gameScene.music.mute){
        gameScene.MuteMusic(true);
        musicBtn.setDepth(1);
      }
      else{
        gameScene.MuteMusic(false);
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

  }
  
}
