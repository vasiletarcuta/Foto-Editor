let canvas, ctx, imgData, histogramaCanvas;
let mx = 0, my = 0, x0 = 0, y0 = 0;
let selectie = null;
let isSelectie = false;

function setareCoordonate(x0, y0, x1, y1) {
    return {
        x: Math.min(x0, x1),
        y: Math.min(y0, y1),
        width: Math.abs(x1 - x0),
        height: Math.abs(y1 - y0)
    };
}

function desenareCoordonate() {
    let coorodonateCursor = document.querySelector('#coordonateCursor');
    coorodonateCursor.innerHTML = `x:${mx} y:${my}`;
}

function desenareSelectie() {
    if (selectie) {
        ctx.strokeStyle = 'green';
        ctx.setLineDash([10, 2]);
        ctx.strokeRect(selectie.x, selectie.y, selectie.width, selectie.height);
    }
}

function mousemove(e) {

    mx = Math.round(e.x - canvas.getBoundingClientRect().x)
    my = Math.round(e.y - canvas.getBoundingClientRect().y)

    if (isSelectie) {
        const coordonateCursor = setareCoordonate(x0, y0, mx, my);

        ctx.putImageData(imgData, 0, 0);
        ctx.strokeStyle = "green";
        ctx.setLineDash([10, 2]);
        ctx.strokeRect(coordonateCursor.x, coordonateCursor.y, coordonateCursor.width, coordonateCursor.height);
        actualizeazaHistogramContinuu();
    }

}

function mousedown() {
    x0 = mx;
    y0 = my;
    setareCoordonate(x0, y0, mx, my);
    isSelectie = true;
    actualizeazaHistogramContinuu();
}

function mouseup() {
    isSelectie = false;
    selectie = setareCoordonate(x0, y0, mx, my);
    desenareSelectie();
    actualizeazaHistogramContinuu();
}

function stergeSelectie() {
    if (selectie != null) {
        const data = imgData.data;

        for (let j = selectie.y; j < selectie.y + selectie.height; j++) {
            for (let i = selectie.x; i < selectie.x + selectie.width; i++) {
                const index = (j * imgData.width + i) * 4; // indexul pixelului in img.data
                data[index] = 255;     // R
                data[index + 1] = 255; // G
                data[index + 2] = 255; // B
                data[index + 3] = 255; // opacitatea maxima
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
}

function efectGri() {

    if (selectie != null) {
        const data = imgData.data;

        for (let j = selectie.y; j < selectie.y + selectie.height; j++) {
            for (let i = selectie.x; i < selectie.x + selectie.width; i++) {
                const index = (j * imgData.width + i) * 4;
                const tonuriDeGri = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
                data[index] = tonuriDeGri;
                data[index + 1] = tonuriDeGri;
                data[index + 2] = tonuriDeGri;
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
}

function efectNegativ() {
    if (selectie != null) {
        const data = imgData.data;

        for (let j = selectie.y; j < selectie.y + selectie.height; j++) {
            for (let i = selectie.x; i < selectie.x + selectie.width; i++) {
                const index = (j * imgData.width + i) * 4;
                data[index] = 255 - data[index];
                data[index + 1] = 255 - data[index + 1];
                data[index + 2] = 255 - data[index + 2];
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
}

//incarcare cu Drag and Drop
function incarcareImagine() {

    const imagineUpload = document.getElementById('imagineUpload');
    const zonaDrop = document.getElementById('imagineCanvas')

    //upload din input -> pe eveniment Change
    imagineUpload.addEventListener('change', function (e) {

        const file = e.target.files[0];

        if (file) {

            const img = new Image();
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            };
            img.src = URL.createObjectURL(file);
        }

    });

    //tratam evenimentul de drag
    zonaDrop.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    //tratam evenimetul de drop
    zonaDrop.addEventListener('drop', function (e) {

        event.preventDefault();
        const file = e.dataTransfer.files[0];

        if (file) {

            const img = new Image();
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            };
            img.src = URL.createObjectURL(file);
        }

    });

}

//salvare imagine PNG
function salvareImagine() {

    const canvas = document.getElementById('imagineCanvas');
    const dataURL = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'imagine.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

}

function calculeazaHistogramaColorata(imgData, selectie = null) {
    const histogramaR = new Array(256).fill(0);
    const histogramaG = new Array(256).fill(0);
    const histogramaB = new Array(256).fill(0);

    const data = imgData.data;

    let startX = 0, startY = 0, width = imgData.width, height = imgData.height;

    if (selectie) {
        startX = selectie.x;
        startY = selectie.y;
        width = selectie.width;
        height = selectie.height;
    }

    for (let y = startY; y < startY + height; y++) {
        for (let x = startX; x < startX + width; x++) {
            const index = (y * imgData.width + x) * 4;
            histogramaR[data[index]]++;     // R
            histogramaG[data[index + 1]]++; // G
            histogramaB[data[index + 2]]++; // B
        }
    }

    return { histogramaR, histogramaG, histogramaB };
}


function deseneazaHistogramaColorata(histograme) {
    const { histogramaR, histogramaG, histogramaB } = histograme;

    const canvas = document.getElementById("histogramaCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 256; // Un pixel pentru fiecare intensitate 0-255
    canvas.height = 150; // inaltimea maxima a graficului

    const maxVal = Math.max(
        Math.max(...histogramaR),
        Math.max(...histogramaG),
        Math.max(...histogramaB)
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 256; i++) {
        const inaltimeR = (histogramaR[i] / maxVal) * canvas.height;
        const inaltimeG = (histogramaG[i] / maxVal) * canvas.height;
        const inaltimeB = (histogramaB[i] / maxVal) * canvas.height;

        // Deseneaza bara pentru R
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(i, canvas.height - inaltimeR, 1, inaltimeR);

        // Deseneaza bara pentru G
        ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
        ctx.fillRect(i, canvas.height - inaltimeG, 1, inaltimeG);

        // Desenează bara pentru B
        ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
        ctx.fillRect(i, canvas.height - inaltimeB, 1, inaltimeB);
    }
}

function actualizeazaHistogramContinuu() {
    const histograma = calculeazaHistogramaColorata(imgData, selectie);
    deseneazaHistogramaColorata(histograma);
}

function decupareDupaSelectie() {
    if (selectie) {
        const dataImagineDecupata = ctx.getImageData(selectie.x, selectie.y, selectie.width, selectie.height);

        canvas.width = selectie.width;
        canvas.height = selectie.height;

        ctx.putImageData(dataImagineDecupata, 0, 0);
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
}

function desenareTextDat() {
    const textInput = document.querySelector('#textInput');
    const dimensiuneInput = document.querySelector('#dimensiuneInput');
    const culoareInput = document.querySelector('#culoareInput');
    const pozXInput = document.querySelector('#pozitieXInput');
    const pozYInput = document.querySelector('#pozitieYInput');

    const canvas = document.getElementById('imagineCanvas');
    const ctx = canvas.getContext('2d');

    const text = textInput.value;
    const dimensiune = parseInt(dimensiuneInput.value, 10);
    const culoare = culoareInput.value;
    const pozX = parseInt(pozXInput.value, 10);
    const pozY = parseInt(pozYInput.value, 10);

    ctx.font = `${dimensiune}px Arial`;
    ctx.fillStyle = culoare;
    ctx.fillText(text, pozX, pozY);

    imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function aplicatie() {

    canvas = document.getElementById('imagineCanvas');
    ctx = canvas.getContext('2d');
    incarcareImagine();

    const buttonGri = document.getElementById('albNegruBtn')
    buttonGri.addEventListener('click', efectGri);

    const buttonNegativ = document.getElementById('bttnNegativ')
    buttonNegativ.addEventListener('click', efectNegativ);
    canvas.addEventListener('mousedown', mousedown);
    canvas.addEventListener('mouseup', mouseup);
    canvas.addEventListener('mousemove', mousemove);
    setInterval(desenareCoordonate, 1000 / 30);

    const salvareBtn = document.getElementById('saveBtn');
    salvareBtn.addEventListener('click', salvareImagine);

    const butonStergere = document.getElementById('stergereSelectieButon');
    butonStergere.addEventListener('click', stergeSelectie);

    const butonDecupare = document.getElementById('decupareBtn');
    butonDecupare.addEventListener('click', decupareDupaSelectie);

    const butonAdaugareText = document.getElementById('adugaTextBtn');
    butonAdaugareText.addEventListener('click', desenareTextDat);
}

document.addEventListener('DOMContentLoaded', aplicatie);