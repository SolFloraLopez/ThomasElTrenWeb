
export default class EndMenu extends Phaser.Scene {
  constructor(score) {
    super({ key: 'end' });
    this.score = score;
  }

  preload()
  {

    this.load.image('endBG', 'img/EndBG.png');
    this.load.image('mainMenuBtn', 'img/MainMenuBtn.png');

  }

  create()
  {
    this.scene.bringToTop(this);
    let inputText = document.createElement("INPUT");
    inputText.setAttribute("type", "text");
    inputText.setAttribute("placeholder", "Nombre");
    document.getElementById("section3").appendChild(inputText); 
    console.log(inputText)

    this.add.image(0,0,'endBG').setOrigin(0);
    let menuButton = this.add.image(275,510,'mainMenuBtn').setOrigin(0);
    this.add.text(110, 269, 'Puntos: '+this.score, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' ,fontSize: '140px',fill: '#00c2eb'});
    menuButton.setInteractive();

    menuButton.on('pointerup',()=>{
      this.sound.play('button');
      this.scene.remove('main');
      this.scene.start('menu');
      this.scene.remove(this);
    });

  }
  
}
