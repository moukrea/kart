const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

function init() {
    console.log('Kart game initializing...');
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Kart Racing Game', canvas.width / 2, canvas.height / 2);
    ctx.font = '16px sans-serif';
    ctx.fillText('Game development starting soon...', canvas.width / 2, canvas.height / 2 + 40);
}

init();
