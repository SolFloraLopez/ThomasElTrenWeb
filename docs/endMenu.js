
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
    this.inputText = document.createElement("input");
    this.inputText.setAttribute("type", "text");
    this.inputText.setAttribute("placeholder", "Nombre");
    this.inputText.setAttribute("maxlenght","3");
    document.body.appendChild(this.inputText); 

    this.inputBtn = document.createElement("input");
    this.inputBtn.setAttribute("type", "button");
    this.inputBtn.setAttribute("id", "saveBtn");
    this.inputBtn.setAttribute("value", "Guardar récord");
    document.body.appendChild(this.inputBtn);
    
    

    this.add.image(0,0,'endBG').setOrigin(0);
    let menuButton = this.add.image(275,530,'mainMenuBtn').setOrigin(0);
    this.add.text(110, 230, 'Puntos: '+this.score, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' ,fontSize: '140px',fill: '#00c2eb'});
    this.add.text(185, 380, '🡇    Guarda tu récord    🡇 \n🡇    al final de la web    🡇', { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' ,fontSize: '60px',fill: '#000000'});
    menuButton.setInteractive();

    menuButton.on('pointerup',()=>{
      this.inputText.parentNode.removeChild(this.inputText);
      this.sound.play('button');
      this.scene.remove('main');
      this.scene.start('menu');
      this.scene.remove(this);
    });

  }
  myFun() {
    
  }
  
}
