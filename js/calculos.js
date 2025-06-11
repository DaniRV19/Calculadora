function calcularInteresCompuesto(capital, interesAnual, anios, aportacionMensual) {
    const resultado = [];
    let total = capital;
    const interesDecimal = interesAnual / 100;
    const aportacionAnual = aportacionMensual * 12;

    for (let año = 1; año <= anios; año++) {
        total = (total + aportacionAnual) * (1 + interesDecimal);
        resultado.push({
            año: año,
            total: total.toFixed(2)
        });
    }

    return resultado;
}
