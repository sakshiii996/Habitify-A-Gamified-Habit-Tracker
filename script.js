let xp = 0, coins = 0, streaks = 0;
let habits = JSON.parse(localStorage.getItem("habits") || "[]");
let username = localStorage.getItem("username");

if (!username) {
    username = prompt("please Enter Your Name");
    if (username) {
        localStorage.setItem("username", username);
    }
}

document.getElementById("greeting").innerHTML = "Hi," + username + "!";

function renderHabits() {
    const container = document.getElementById("habitCategories");
    container.innerHTML = "";
    const categories = ["Study", "Health", "Personal", "Other"];
    const today = new Date().toLocaleDateString();
    categories.forEach(cat => {
        const section = document.createElement("div");
        section.innerHTML = `<h4>${cat}</h4><ul id="cat-${cat}"></ul>`;
        container.appendChild(section);
    });

    habits.forEach((h, i) => {
        if (h.lastDone !== today) {
            h.done = false;
        }
        const li = document.createElement("li");
        li.innerHTML = `<span>${h.name} ${h.done ? "✅" : ""}</span>
        <div>
        <button data-index="${i}">Done</button>
        <button data-index="${i}">❌</button>
        </div>`;
        document.getElementById("cat-" + h.category).appendChild(li);
    });
    localStorage.setItem("habits", JSON.stringify(habits));
};

function addHabit() {
    const input = document.getElementById("habitInput");
    const category = document.getElementById("categorySelect").value;
    if (input.value.trim() === "") return;
    habits.push({ name: input.value, done: false, category });
    input.value = "";
    renderHabits();
}

function removeHabit(i) {
    habits.splice(i, 1);
    renderHabits();
}

function toggleHabit(i) {
    const today = new Date().toLocaleDateString();
    if (habits[i].lastDone !== today) {
        habits[i].done = false;
    }
    if (!habits[i].done) {
        habits[i].done = true;
        habits[i].lastDone = today;
        xp += 10;
        coins += 5;
        updateStats();
        updateChart();
        alert(`${habits[i].name} is completed for today !`);
    }
    else {
        alert(`${habits[i].name} is already done for today !`);
    }
    renderHabits();
}

function updateStats() {
    document.getElementById("xp").innerHTML = xp + "XP";
    document.getElementById("coins").innerHTML = coins + "Coins";
    document.getElementById("streaks").innerHTML = `<li>🔥 ${streaks}-day streak!</li>`;

}

function endDay() {
    if (habits.every(h => h.done) && habits.length > 0) {
        streaks++;
       
    }
    habits.forEach(h => h.done = false);
    updateStats();
    renderHabits();
}

function resetAll() {
    if (confirm("Are you sure you want to reset all data?")) {
        xp = coins = streaks = 0;
        habits = [];
        localStorage.clear();
        updateStats();
        renderHabits();
    }
}

async function aiSuggest() {

    let habits = JSON.parse(localStorage.getItem("habits") || "[]");

    if (habits.length === 0) {
        document.getElementById("aiSuggestions").innerText = "⚠️ No Habits found , Please add some first !";
        return;
    }

    let habitstext = habits
        .map(h => `${h.name} (${h.category || "Uncategorized"}) - ${h.done ? "Done" : "pending"}`)
        .join("\n");

    try {
        const API_KEY = "AIzaSyDsqxSQ4abyW9UbqxpuRzxaMqSRp1mhu40";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;


        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [
                        { text: "You are a supportive habit coach. Be short, clear, and motivating." },
                        { text: `Here is my habit list:\n${habitstext}\n\nGive me one short motivational suggestion.` }
                    ]

                }],
                generationConfig: {
                    maxOutputTokens: 100,
                }

            })
        });

        const data = await response.json();
        const suggestion = data.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "No Suggestions Available";

        document.getElementById("aiSuggestions").innerText = suggestion;
    } catch (err) {
        console.error(err);
        document.getElementById("aiSuggestions").innerText = "⚠️ Could not fetch AI suggestion. Check your API key or internet.";
    }
};
  
function updateChart() {
    const ctx = document.getElementById("statsChart").getContext("2d");
    ctx.clearRect(0, 0, 180, 180);

    let done = habits.filter(h => h.done).length, total = habits.length;
    let percent = total ? done / total : 0;

   
    const isDark = document.body.classList.contains("dark-mode");

    // background circle
    ctx.beginPath();
    ctx.arc(90, 90, 70, 0, 2 * Math.PI);
    ctx.strokeStyle = isDark ? "#243f63ff" : "#f4f7fbff"; 
    ctx.lineWidth = 15;
    ctx.stroke();

    // progress arc
    ctx.beginPath();
    ctx.arc(90, 90, 70, -Math.PI / 2, 2 * Math.PI * percent - Math.PI / 2);
    ctx.strokeStyle = isDark ? "#a3cdf9ff" : "#172c4aff"; 
    ctx.lineWidth = 15;
    ctx.stroke();

    // text in center
    ctx.fillStyle = isDark ? "#e8f0f7ff" : "#11223cff"; 
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${done}/${total}`, 90, 95);
}

function toggleMenu() {
    const menu = document.getElementById("mobileMenu");
    const content = document.getElementById("mobileMenuContent");
    const left = document.getElementById("leftSidebar");
    const right = document.getElementById("rightSidebar");
    const settingsBtn = document.getElementById("settingsBtn");
    const closeBtn = document.getElementById("close");

    if (menu.style.display === "block") {
       
        document.body.insertBefore(left, document.body.firstChild);
        document.body.appendChild(right);
        menu.style.display = "none";
        settingsBtn.style.display = "block"; 
    } else {
        
        content.innerHTML = "";
        content.appendChild(left);
        content.appendChild(right);
        menu.style.display = "block";
        settingsBtn.style.display = "none"; 
    }

   
    closeBtn.onclick = () => {
        menu.style.display = "none";
        document.body.insertBefore(left, document.body.firstChild);
        document.body.appendChild(right);
        settingsBtn.style.display = "block";
    };

    updateChart();
}



let rewards = JSON.parse(localStorage.getItem("rewards") || "[]");

function renderRewards() {
    const container = document.getElementById("rewards");
    container.innerHTML = "";
    rewards.forEach((r, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<span id="mainReward">${r.name} - ${r.cost} 💰 ${r.purchased ? "✅" : ""}</span>
            <div id="rewardButtons">
           <button data-index="${i}" ${r.purchased ? "disabled" : ""}>${r.purchased ? "Owned" : "Buy"}</button>
            <button data-index="${i}">❌</button>
            </div>`;

            container.appendChild(li);

    });
    localStorage.setItem("rewards", JSON.stringify(rewards));
}


function addReward(){
    const name = document.getElementById("rewardInput").value.trim();
    const cost = parseInt(document.getElementById("rewardCost").value);

    if(name && cost > 0){
        rewards.push({name, cost, purchased : false});
        document.getElementById("rewardInput").value = "";
        document.getElementById("rewardCost").value = "";
        renderRewards();
    }
}

function purchaseReward(i) {
    
    if (coins >= rewards[i].cost && !rewards[i].purchased){
        coins -= rewards[i].cost;
        rewards[i].purchased = true;
        updateStats();
        renderRewards();
        alert(`You purchased : ${rewards[i].name} !`);
    }
    else if(rewards[i].purchased){
        alert("You already own this reward !");
    }
    else{
        alert("Not enough coins !");
    }
}

function removeReward(i) {
     rewards.splice(i,1);
     renderRewards();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");


  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark);


  document.getElementById("themeToggle").textContent = isDark ? "🌞" : "🌙";

 
  updateChart();
}


window.onload = () => {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("themeToggle").textContent = "🌞";
  }
  renderHabits();
  updateStats();
  updateChart();
  renderRewards();
};


document.body.addEventListener("click", function(e){
    if(e.target && e.target.textContent === "Done"){
        const index = e.target.getAttribute("data-index");
        toggleHabit(index);
    }
    if(e.target && e.target.textContent === "❌"){
        const index = e.target.getAttribute("data-index");
        removeHabit(index);
    }
    if(e.target && (e.target.textContent === "Buy" || e.target.textContent === "Owned")){
        const index = e.target.getAttribute("data-index");
        purchaseReward(index);
    }
    if(e.target && e.target.textContent === "❌" && e.target.parentElement.id === "rewardButtons"){
        const index = e.target.getAttribute("data-index");
        removeReward(index);
    }
});



renderHabits(); updateStats(); updateChart(); renderRewards();


