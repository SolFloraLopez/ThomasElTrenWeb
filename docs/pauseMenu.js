
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
    let resumeButton = this.add.image(275,330,'resumeBtn').setOrigin(0);
    let menuButton = this.add.image(275,510,'mainMenuBtn').setOrigin(0);
    resumeButton.setInteractive();
    menuButton.setInteractive();

    resumeButton.on('pointerup',()=>{
      this.scene.resume('main');
      this.scene.stop(this);
    });
    menuButton.on('pointerup',()=>{
      this.scene.remove('main')
      this.scene.start('menu');
    });

  }
  
}
