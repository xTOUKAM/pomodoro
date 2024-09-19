let temps;
let estEnRoute = false;
let tempsRestant = 25 * 60;

function miseAJourTemps() {
    const minutes = Math.floor(tempsRestant / 60);
    const secondes = tempsRestant % 60;

    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('secondes').textContent = String(secondes).padStart(2, '0');

    updateBackgroundColor();

    // Si le temps restant est égal à 0, on joue un son
    if (tempsRestant === 0) {
        const audio = new Audio('../content/midnight.mp3');
        audio.play();
    }
}

function interpolateColor(color1, color2, factor) {
    const result = color1.slice(1).match(/.{2}/g).map((hex, i) => {
        return Math.round(parseInt(hex, 16) * (1 - factor) + parseInt(color2.slice(1).substring(i * 2, i * 2 + 2), 16) * factor).toString(16).padStart(2, '0');
    });
    return `#${result.join('')}`;
}

function updateBackgroundColor() {
    const totalDuration = 25 * 60; // Durée totale en secondes
    const progress = (totalDuration - tempsRestant) / totalDuration;

    // Couleurs de début et de fin
    const startColor = "#F4CFDF"; // Rose pâle
    const endColor = "#B0E57C"; // Vert clair

    // Calculer la couleur interpolée
    const backgroundColor = interpolateColor(startColor, endColor, progress);

    document.querySelector('.container').style.backgroundColor = backgroundColor;
}


function start() {
    if (!estEnRoute) {
        estEnRoute = true;
        temps = setInterval(() => {
            tempsRestant--;
            miseAJourTemps();
            if (tempsRestant <= 0) {
                clearInterval(temps);
                estEnRoute = false;
            }
        }, 1);
    }
}

function pause() {
    if(!estEnRoute) return;
    clearInterval(temps);
    estEnRoute = false;
}

function reset() {
    clearInterval(temps);
    estEnRoute = false;
    tempsRestant = 25 * 60;
    miseAJourTemps();
}

miseAJourTemps();

