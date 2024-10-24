const TABSIZE = 10;
const playerTab = { "porteavions": [],
                    "cuirasse": [],
                    "sousmarin": [],
                    "contretorpilleur": [],
                    "lancetorpilles": []};
const opponentTab = [];
let currentBoat;
let numBoatPartsPlaced = 0;
let gameHasStarted = false;

function generateArray(section) {
    let newTable;
    
}

function createTable(player, section) {
    let newTable = document.createElement("table");
    let aside = section.lastElementChild;
    let firstLine = document.createElement("tr");
    firstLine.appendChild(document.createElement("td"));
    for (let i = 0; i < TABSIZE; i++){
        let newTD = document.createElement("td");
        newTD.innerHTML = i+1;
        firstLine.appendChild(newTD);
    }
    newTable.appendChild(firstLine);
    for (let i = 0; i < TABSIZE; i++){
        let newTR = document.createElement("tr");
        let firstTD = document.createElement("td");
        firstTD.innerHTML = String.fromCharCode(65 + i);
        newTR.appendChild(firstTD);
        for (let j = 0; j < TABSIZE; j++){
            let newTD = document.createElement("td");
            newTD.dataset.row = String.fromCharCode(65 + i);
            newTD.dataset.column = j+1;
            if (player){
                newTD.addEventListener("click", function(){
                    if (!gameHasStarted){
                        if (newTD.className == currentBoat){
                            newTD.className = "";
                        }
                        else {
                            newTD.className = currentBoat;
                        }   
                    }
                });
            }
            else{
                newTD.addEventListener("click", function(){
                    if (gameHasStarted){
                        console.log("Hello");
                    }
                });
            }
            
            newTR.appendChild(newTD);
        }
        newTable.appendChild(newTR);
    }
    section.insertBefore(newTable, aside);
}

document.addEventListener("DOMContentLoaded", function() {

    // socket ouverte vers le serveur
    let sock = io.connect();

    currentBoat = document.querySelector("input[name='radBateau']:checked").value;

    let main = document.getElementsByTagName("main")[0];
    createTable(false, main.firstElementChild);
    createTable(true, main.lastElementChild);

    let radios = document.querySelectorAll("input");
    radios.forEach(function(e){
        e.addEventListener("input", function(){
            currentBoat = document.querySelector("input[name='radBateau']:checked").value;
        });
    });

    sock.on("a_toi", function(msg){
        gameHasStarted = true;
        main.classList.add("PartieEnCours");
    })

    document.getElementById("btnDemarrer").addEventListener("click", function(){
        // temporaire, devra être déclenché par un "a_toi" ou "a_l_autre" du serveur
        gameHasStarted = true;
        main.classList.add("partieEnCours");
        console.log(playerTab);

        console.log(playerTab["lancetorpilles"].length);
        sock.emit("demarrer", );
    });
});