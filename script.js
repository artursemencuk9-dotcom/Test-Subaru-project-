// Функция анимации «набегающих» цифр приборной панели
function animateCounters() {
    const counters = document.querySelectorAll('.stat-value');
    const speed = 60;

    counters.forEach(counter => {
        const animate = () => {
            const target = +counter.getAttribute('data-target');
            const current = +counter.innerText.replace(/\s/g, '');
            const increment = Math.ceil(target / speed);

            if (current < target) {
                const nextValue = current + increment > target ? target : current + increment;
                counter.innerText = nextValue.toLocaleString('ru-RU');
                setTimeout(animate, 20);
            } else {
                counter.innerText = target.toLocaleString('ru-RU');
            }
        };
        animate();
    });
}

document.addEventListener('DOMContentLoaded', animateCounters);

function updateLiveStats() {
    const residentStat = document.getElementById('statResidents');
    const currentTarget = parseInt(residentStat.getAttribute('data-target'));
    const newTarget = currentTarget + 1;
    residentStat.setAttribute('data-target', newTarget);
    residentStat.innerText = newTarget.toLocaleString('ru-RU');
}

// Перехватываем форму генерации сертификатов
const regForm = document.getElementById('regForm');

regForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('userName').value;
    const city = document.getElementById('userCity').value;
    const model = document.getElementById('carModel').value;
    const year = document.getElementById('carYear').value;
    
    const randomId = Math.floor(100000 + Math.random() * 900000);
    const targetElementId = `sub-${randomId}`; 
    const residentIdText = `ID РЕЗИДЕНТА: #SUB${randomId}`;
    const carDetails = `${model} (${year}), г. ${city}`;

    // Генерируем QR-код (ссылка ведет на страницу резидентов к карточке участника)
    const currentBaseUrl = window.location.href.replace('index.html', '') + 'residents.html';
    const personalVehicleUrl = `${currentBaseUrl}#${targetElementId}`;

    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = ''; 
    
    new QRCode(qrContainer, {
        text: personalVehicleUrl,
        width: 120,
        height: 120,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    setTimeout(function() {
        const qrImage = qrContainer.querySelector('img');
        const canvas = document.getElementById('certCanvas');
        const ctx = canvas.getContext('2d');

        const templateImg = new Image();
        templateImg.src = 'certificate.png'; 

        templateImg.onload = function() {
            canvas.width = templateImg.width;
            canvas.height = templateImg.height;

            ctx.drawImage(templateImg, 0, 0);
            const centerX = canvas.width / 2;

            // Рисуем имя
            ctx.font = "bold 38px 'Segoe UI', Arial, sans-serif";
            ctx.fillStyle = "#0074e4"; 
            ctx.textAlign = "center";
            ctx.fillText(name.toUpperCase(), centerX, canvas.height * 0.45); 

            // Рисуем авто
            ctx.font = "500 24px 'Segoe UI', Arial, sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(carDetails, centerX, canvas.height * 0.60); 

            // Рисуем ID
            ctx.font = "16px 'Segoe UI', Arial, sans-serif";
            ctx.fillStyle = "#888888";
            ctx.fillText(residentIdText, centerX, canvas.height * 0.85); 

            if (qrImage) {
                const qrX = canvas.width - 150;
                const qrY = canvas.height - 170;
                const qrSize = 100;
                ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
            }

            const finalImageDataUrl = canvas.toDataURL('image/png');
            const previewBox = document.getElementById('imagePreviewBox');
            previewBox.innerHTML = `<img src="${finalImageDataUrl}" alt="Ваш сертификат">`;

            document.getElementById('certPlaceholder').style.display = 'none';
            document.getElementById('certResultContainer').style.display = 'block';

            document.getElementById('downloadBtn').onclick = function() {
                const link = document.createElement('a');
                link.download = `Subaru_Cert_ID_${randomId}.png`;
                link.href = finalImageDataUrl;
                link.click();
            };

            updateLiveStats();
            regForm.reset();
        };

        templateImg.onerror = function() {
            alert("Пожалуйста, убедитесь, что файл 'certificate.png' добавлен в папку с проектом.");
        };
    }, 100);
});
