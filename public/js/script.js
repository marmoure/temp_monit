const TemperatureSpan = document.getElementById("Temperature");
const tempChart = new Chart(document.getElementById('temp-chart').getContext('2d'), options("Temperature",'rgb(255, 99, 132)'));


setInterval(() => {
    fetch("/history")
        .then(data => data.json())
        .then((history) => {
            // {temperature, pressure, wind ,moist,humidity}
            tempChart.data.datasets[0].data = history.map(h => {
                return {y: h.temperature,x:h.time}
            })

            tempChart.update();


            TemperatureSpan.innerText = history.slice(-1)[0].temperature;

        })
        .catch(console.log)
}, 5000);



function options(label,color) {
    return {
        type: 'line',
        data: {
            datasets: [{
                label: label,
                backgroundColor: color,
                borderColor: color,
                data: [],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio:false,
            scales: {
                x:{
                    type: 'time',
                    time: {
                        unit:"minute",
                        displayFormats: {
                            second: 'hh:mm:ss'
                        }
                    }
                },
                // y: {
                //     beginAtZero: true
                // }
            }
        }
    }
}
