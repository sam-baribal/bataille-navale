const TABSIZE = 10;
const playerTab = {
    "porteavions": [],
    "cuirasse": [],
    "sousmarin": [],
    "contretorpilleur": [],
    "lancetorpilles": []
};
const boatLength = {
    "porteavions": 5,
    "cuirasse": 4,
    "sousmarin": 3,
    "contretorpilleur": 3,
    "lancetorpilles": 2
};
let currentBoat;
let numBoatPartsPlaced = 0;
let gameHasStarted = false;
let yourTurn = false;

function addRestartButton(element) {
    button = document.createElement("button");
    button.id = "btnRedemarrer";
    button.innerHTML = "Nouvelle partie";
    button.addEventListener("click", function(){document.location.reload()});
    element.appendChild(button);
}

function areNeighbours(pos1, pos2){
    if (Array.isArray(pos2)){
        for (const element of pos2){
            if (areNeighbours(pos1, element)){
                return true;
            }
        }
        return false;
    }
    let pos1Row = pos1.charCodeAt(0);
    let pos1Col = Number(pos1.substr(1));
    let pos2Row = pos2.charCodeAt(0);
    let pos2Col = Number(pos2.substr(1));
    return ((pos1Row === pos2Row && (pos1Col === pos2Col + 1 || pos1Col === pos2Col - 1)) || (pos1Col === pos2Col && (pos1Row === pos2Row + 1 || pos1Row === pos2Row - 1))); 
}

function boatNewLocationCheck(boatType, newPos){
    let arrayPos = playerTab[boatType];
    if (arrayPos.length > 0){
        if (arrayPos.length >= boatLength[boatType]){
            return false;
        }
        if (arrayPos.length < 2){
            console.log("1");
            return (areNeighbours(arrayPos[0], newPos));
        }
        // else
        if (arrayPos[0].charCodeAt(0) == arrayPos[1].charCodeAt(0)){
            console.log("2");
            return (arrayPos[0].charCodeAt(0) === newPos.charCodeAt(0) && areNeighbours(newPos, arrayPos));
        }
        if (Number(arrayPos[0].substr(1)) === Number(arrayPos[1].substr(1))){
            console.log("3");
            return (Number(arrayPos[0].substr(1)) === Number(newPos.substr(1)) && areNeighbours(newPos, arrayPos));
        }
    }
    //else
    console.log("4");
    return true;
}

function displayNewMessage(origin, msg) {
    let d = new Date();
    let clock = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
    let newMessage = document.createElement("p");
    let aside = document.querySelector("aside");
    aside.insertBefore(newMessage, aside.firstElementChild);
    newMessage.className = origin;
    newMessage.innerHTML = `${clock} - `; 
    switch (origin) {
        case "serveur":
            if (typeof msg !== "string"){
                newMessage.innerHTML += `[${msg.emetteur ? "Vous" : "Adversaire"}] Tir en ${msg.coords} :
                ${["dans l'eau", "touché", "coulé", "coulé & game over"][msg.statut]}<br>`;
                
                if (msg.emetteur === true){
                    newMessage.innerHTML += (msg.statut != 3) ? "En attente du tir de l'adversaire." : "";
                    if (msg.statut !== 0){
                    document.querySelector(`td[data-row="${msg.coords.substr(0,1)}"][data-column="${msg.coords.substr(1)}"]`).classList.add("touche");
                    }
                    yourTurn = false;
                }
                else {
                    newMessage.innerHTML += (msg.statut != 3) ? "A vous de jouer." : "";
                    let section = document.querySelectorAll("section")[1];
                    console.log(section);
                    console.log(section.querySelectorAll(`td[data-row="${msg.coords.substr(0,1)}"][data-column="${msg.coords.substr(1)}"]`));
                    section.querySelectorAll(`td[data-row="${msg.coords.substr(0,1)}"][data-column="${msg.coords.substr(1)}"]`)[0].classList.add("tir");
                    yourTurn = true;
                }
                if (msg.statut === 3){
                    addRestartButton(newMessage);
                }
            }
            else {
                newMessage.innerHTML += `${msg}`;
            }
            break;
        case "adversaire":
            newMessage.innerHTML += `Message de votre adversaire : ${msg}`;
            break;
        case "moi":
            newMessage.innerHTML += `Message envoyé à l'adversaire : ${msg}`;
            break;
    }
}

document.addEventListener("DOMContentLoaded", function() {

    // socket ouverte vers le serveur
    let sock = io.connect();

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
                                let index = playerTab[currentBoat].indexOf(`${newTD.dataset.row}${newTD.dataset.column}`);
                                playerTab[currentBoat].splice(index, 1);
                            }
                            else {
                                if(boatNewLocationCheck(currentBoat, `${newTD.dataset.row}${newTD.dataset.column}`)){
                                    if (newTD.className === ""){
                                        newTD.className = currentBoat;
                                        playerTab[currentBoat].push(`${newTD.dataset.row}${newTD.dataset.column}`);
                                    }
                                }
                            }   
                        }
                    });
                }
                else{
                    newTD.addEventListener("click", function(){
                        if (gameHasStarted){
                            if (yourTurn){
                                newTD.className = "tir";
                            }
                            sock.emit("tir", `${newTD.dataset.row}${newTD.dataset.column}`);
                        }
                    });
                }
                
                newTR.appendChild(newTD);
            }
            newTable.appendChild(newTR);
        }
        section.insertBefore(newTable, aside);
    }

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

    sock.on("erreur", function(msg){
        displayNewMessage("serveur", msg);
    });

    sock.on("en_attente", function(msg){
        displayNewMessage("serveur", msg);
    });

    sock.on("a_toi", function(msg){
        displayNewMessage("serveur", msg);
        gameHasStarted = true;
        yourTurn = true;
        document.body.classList.add("partieEnCours");
    })

    sock.on("a_l_autre", function(msg){
        displayNewMessage("serveur", msg);
        gameHasStarted = true;
        yourTurn = false;
        document.body.classList.add("partieEnCours");
    })

    sock.on("resultat", function(msg){
        displayNewMessage("serveur", msg);
    });

    sock.on("deconnexion", function(msg){
        displayNewMessage("serveur", msg);
    });
    
    sock.on("message", function(msg){
        displayNewMessage("adversaire", msg);
    });

    document.getElementById("btnDemarrer").addEventListener("click", function(){
        console.log(playerTab);
        console.log(playerTab["lancetorpilles"].length);
        sock.emit("demarrer", playerTab);
    });

    document.getElementById("btnEnvoyer").addEventListener("click", function(){
        sock.emit("message", document.getElementById("txtMsg").value);
        displayNewMessage("moi", document.getElementById("txtMsg").value);
    });
});