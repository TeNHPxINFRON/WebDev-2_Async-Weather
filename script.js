const API_KEY = "fdad67ebbece84f107ef09f4a09c56af";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";


function log(message, type) {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const panel = document.getElementById("consolePanel");
    const line = document.createElement("div");
    line.className = "log-" + type;
    line.textContent = "[" + type.toUpperCase() + "] " + message;
    panel.appendChild(line);
    panel.scrollTop = panel.scrollHeight;
}

function clearConsolePanel() {
    document.getElementById("consolePanel").innerHTML = "";
}


function getHistory() {
    return JSON.parse(localStorage.getItem("weatherHistory") || "[]");
}

function saveCity(city) {
    var history = getHistory();

      
    history = history.filter(function(c) {
        return c.toLowerCase() !== city.toLowerCase();
    });

    history.unshift(city);             
    if (history.length > 6) {
        history.pop();                  
    }
    
    localStorage.setItem("weatherHistory", JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    var container = document.getElementById("historyContainer");
    container.innerHTML = "";

    var history = getHistory();

    history.forEach(function(city) {
        var btn = document.createElement("button");
        btn.className = "history-btn";
        btn.textContent = city;
        btn.onclick = function() {
            document.getElementById("cityInput").value = city;
            handleSearch();
        };
        container.appendChild(btn);
    });
}


async function fetchWeather(city) {
    log("Sync Start", "sync");
    log("Sync End", "sync");
    
    log("Start fetching weather for: " + city, "async");
    
    setTimeout(function() {
        log("setTimeout (Macrotask)", "macro");
    }, 0);

    try {
        
        var response = await fetch(
            API_URL + "?q=" + encodeURIComponent(city) +
            "&appid=" + API_KEY + "&units=metric"
        );
        
        var data = await response.json().then(function(d) {
            log("Promise.then (Microtask)", "micro");
            return d;
        });

      
        if (data.cod === "404" || data.cod === 404) {
            throw new Error("City not found");
        }
        
        if (!response.ok) {
            throw new Error("API error");
        }


        log("Data received", "async");
        return data;

    } catch (error) {
        throw error; 
    }
}


function showWeather(data) {
    document.getElementById("weatherInfo").innerHTML =
    '<table class="weather-table">' +
    '<tr><td>City</td>     <td>' + data.name + ', ' + data.sys.country + '</td></tr>' +
    '<tr><td>Temp</td>     <td>' + data.main.temp + ' °C</td></tr>' +
    '<tr><td>Weather</td>  <td>' + data.weather[0].main + '</td></tr>' +
    '<tr><td>Humidity</td> <td>' + data.main.humidity + '%</td></tr>' +
    '<tr><td>Wind</td>     <td>' + data.wind.speed + ' m/s</td></tr>' +
    '</table>';
}

function showError(message) {
    document.getElementById("weatherInfo").innerHTML =
    '<p class="error-text">' + message + '</p>';
}


function handleSearch() {
    var city = document.getElementById("cityInput").value.trim();
    if (city === "") {
        showError("Please enter a city name.");
        return;
    }

    clearConsolePanel();
    document.getElementById("weatherInfo").textContent = "Loading...";

    
    fetchWeather(city)
    .then(function(data) {
        showWeather(data);
        saveCity(data.name);
    })
    .catch(function(error) {
        log("Error: " + error.message, "error");

        if (error.message === "City not found") {
            showError("City not found. Please check the spelling.");
        } 
        
        else if (error.message.includes("Failed to fetch")) {
            showError("Network error. Check your internet connection.");
        } 

        else {
            showError("Something went wrong. Please try again.");
          }
        });
    }
    
    
    document.getElementById("cityInput").addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            handleSearch();
        }
    });
    
    renderHistory();