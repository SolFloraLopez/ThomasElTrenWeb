const SEPARATION = 43;
export default class Leaderboard extends Phaser.Scene {
  constructor(score) {
    super({ key: 'leaderboard' });
  }

  preload()
  {

    this.load.image('leaderboardBG', 'img/leaderboardBG.png');
    this.load.image('backBtn', 'img/backBtn.png');

  }

  create()
  {
    this.scene.bringToTop(this);
    this.add.image(0,0,'leaderboardBG').setOrigin(0);

    //Uso del DOM
    let scoreboard = JSON.parse(localStorage.getItem('scoreboard'));

   if(scoreboard!=null){
     //Muestra de los 10 primeros en pantalla
     let y = 333;
     for (let i = 0; i<10 && scoreboard[i]!=null;i++){
      this.add.text(299, y, scoreboard[i].name, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' ,fontSize: '50px',fill: '#00c2eb'});
      this.add.text(760, y, scoreboard[i].score, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' ,fontSize: '50px',fill: '#00c2eb'});
      y = y +SEPARATION;
     }
    }
 
    let backBtn = this.add.image(1175,610,'backBtn').setOrigin(0);
    
    backBtn.setInteractive();

    backBtn.on('pointerup',()=>{
      this.sound.play('button');
      this.scene.resume('menu');
      this.scene.stop(this);
    });

  }
  
}
