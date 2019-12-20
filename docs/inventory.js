//Clase para el inventario
export default class Inventory extends Phaser.GameObjects.GameObject {
    constructor(scene,railCounter)
    {
        super(scene);
        this.railCounter = railCounter;
        this.railBCounter = 3;
        let num = this.railCounter-1;
        let numB = this.railBCounter-1;
        this.railCounterText = this.scene.add.text(1155, 90, 'Raíles: '+ num, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' ,fontSize: '28px',fill: '#00c4ef'});
        this.railBCounterText = this.scene.add.text(1155, 150, 'Raíles puente: '+ numB, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' ,fontSize: '27px',fill: '#00c4ef'});
    }
    //Métodos para actualizar el texto de contadores
    UpdateRailCounterText(){
        let num = this.railCounter-1;
        if(num<0) num =0;
        if(num===0)this.railCounterText.setFill('#cd0000');
        else this.railCounterText.setFill('#00c4ef');
    this.railCounterText.setText('Raíles: '+ num);
    }
    UpdateRailBCounterText(){
        let numB = this.railBCounter-1;
        if(numB<0) numB =0;
        if(numB===0)this.railBCounterText.setFill('#cd0000');
        else this.railBCounterText.setFill('#00c4ef');
    this.railBCounterText.setText('Raíles puente: '+ numB);
    }
    //Modifica el contador especificado
    ModifyRailCounter(num,counter)
    {
        if(counter==='A'){
            this.railCounter+=num;
            this.UpdateRailCounterText();
        } 
        else if (counter === 'B'){
            this.railBCounter+=num;
            this.UpdateRailBCounterText();
        } 
    }
    GetRailCounter(counter){
        if(counter==='A') return this.railCounter;
        else if (counter === 'B') return this.railBCounter;
    }
}