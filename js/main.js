// Referencias DOM
const calcularBtn = document.getElementById("calcularBtn");
const resultadosSection = document.getElementById("resultados");
const tablaResultados = document.getElementById("tablaResultados");
const graficaCanvas = document.getElementById("graficaResultados");

let grafica; // Para guardar la instancia de ChartJS

// Mostrar/Ocultar spinner (si quieres implementarlo)
function mostrarSpinner(mostrar) {
    let spinner = document.getElementById("spinner");
    if (!spinner) {
        spinner = document.createElement("div");
        spinner.id = "spinner";
        spinner.className = "fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50";
        spinner.innerHTML = `<div class="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-indigo-500"></div>`;
        document.body.appendChild(spinner);
    }
    spinner.style.display = mostrar ? "flex" : "none";
}

// Función que calcula el interés compuesto y retorna un array con los años y valores acumulados
function calcularInteresCompuesto(capital, interes, anios, aportacion) {
    const resultados = [];
    let total = capital;

    for (let i = 1; i <= anios; i++) {
        total = total * (1 + interes / 100) + aportacion;
        resultados.push({ anio: i, valor: total.toFixed(2) });
    }
    return resultados;
}

// Guardar cálculo nuevo en localStorage (array)
function guardarCalculo(nuevoCalculo) {
    let historial = JSON.parse(localStorage.getItem("historialCalculos")) || [];
    historial.push(nuevoCalculo);
    localStorage.setItem("historialCalculos", JSON.stringify(historial));
}

// Obtener historial
function obtenerHistorial() {
    return JSON.parse(localStorage.getItem("historialCalculos")) || [];
}

// Eliminar cálculo por ID
function eliminarCalculo(id) {
    let historial = obtenerHistorial();
    historial = historial.filter(calc => calc.id !== id);
    localStorage.setItem("historialCalculos", JSON.stringify(historial));
}

// Mostrar historial en el DOM
function mostrarHistorial() {
    const historial = obtenerHistorial();
    const contenedor = document.getElementById("listaHistorial");
    if (!historial.length) {
        contenedor.innerHTML = "<p class='text-gray-500'>No hay cálculos guardados.</p>";
        return;
    }

    contenedor.innerHTML = historial.map(calc => `
        <div class="p-3 border rounded shadow flex justify-between items-center bg-white">
            <div>
                <p><strong>ID:</strong> ${calc.id}</p>
                <p><strong>Fecha:</strong> ${calc.fecha}</p>
                <p><strong>Capital:</strong> €${calc.capital}</p>
                <p><strong>Interés:</strong> ${calc.interes}%</p>
                <p><strong>Años:</strong> ${calc.anios}</p>
                <p><strong>Aportación anual:</strong> €${calc.aportacion}</p>
            </div>
            <div class="space-x-2">
                <button class="verBtn bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700" data-id="${calc.id}">Ver</button>
                <button class="borrarBtn bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" data-id="${calc.id}">Eliminar</button>
            </div>
        </div>
    `).join("");

    // Añadir eventos a botones Ver y Eliminar
    document.querySelectorAll(".verBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.getAttribute("data-id"));
            const calculo = historial.find(c => c.id === id);
            mostrarTabla(calculo.resultados);
            dibujarGrafica(calculo.resultados);
            resultadosSection.classList.remove("opacity-0", "translate-y-4");
        });
    });

    document.querySelectorAll(".borrarBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.getAttribute("data-id"));
            eliminarCalculo(id);
            mostrarHistorial();
            // Si borramos cálculo visible, ocultamos resultados
            resultadosSection.classList.add("opacity-0", "translate-y-4");
        });
    });
}

// Mostrar tabla con resultados
function mostrarTabla(resultados) {
    let html = `
    <table class="table-auto w-full border border-gray-300">
        <thead class="bg-indigo-600 text-white">
            <tr>
                <th class="border border-indigo-700 px-4 py-2">Año</th>
                <th class="border border-indigo-700 px-4 py-2">Valor (€)</th>
            </tr>
        </thead>
        <tbody>
    `;

    resultados.forEach(row => {
        html += `
            <tr>
                <td class="border border-gray-300 px-4 py-2 text-center">${row.anio}</td>
                <td class="border border-gray-300 px-4 py-2 text-right">${row.valor}</td>
            </tr>
        `;
    });

    html += "</tbody></table>";

    tablaResultados.innerHTML = html;
}

// Dibujar gráfica con ChartJS
function dibujarGrafica(resultados) {
    if (grafica) {
        grafica.destroy();
    }

    const labels = resultados.map(r => `Año ${r.anio}`);
    const data = resultados.map(r => r.valor);

    grafica = new Chart(graficaCanvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Valor acumulado (€)',
                data,
                borderColor: 'rgba(99, 102, 241, 1)', // indigo-500
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 3,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                }
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 14,
                        }
                    }
                }
            }
        }
    });
}

// Evento calcular
calcularBtn.addEventListener("click", () => {
    const capital = parseFloat(document.getElementById("capital").value) || 0;
    const interes = parseFloat(document.getElementById("interes").value) || 0;
    const anios = parseInt(document.getElementById("anios").value) || 0;
    const aportacion = parseFloat(document.getElementById("aportacion").value) || 0;

    if (capital < 0 || interes < 0 || anios <= 0 || aportacion < 0) {
        alert("Por favor, introduce valores válidos.");
        return;
    }



    setTimeout(() => {
        const resultados = calcularInteresCompuesto(capital, interes, anios, aportacion);

        const nuevoCalculo = {
            id: Date.now(),
            fecha: new Date().toLocaleString(),
            capital,
            interes,
            anios,
            aportacion,
            resultados
        };

        guardarCalculo(nuevoCalculo);
        mostrarHistorial();

        mostrarTabla(resultados);
        dibujarGrafica(resultados);

        resultadosSection.classList.remove("opacity-0", "translate-y-4");

        mostrarSpinner(false);

        // Aquí limpiamos los inputs para dejar el formulario vacío
        document.getElementById("capital").value = "";
        document.getElementById("interes").value = "";
        document.getElementById("anios").value = "";
        document.getElementById("aportacion").value = "";


    }, 500);
});

// Mostrar historial al cargar página
document.addEventListener("DOMContentLoaded", () => {
    mostrarHistorial();
});
