import {ui_state} from "./hanoiTower.js";
import { select_sound, playSound } from "./audio.js";

type LeaderboardState = {
    level: number,
    score: number,
}

const leaderboard_btn = document.getElementById("leaderboard_btn");
const leaderboard = document.getElementById("leaderboard");
const leaderboard_res = document.getElementById("leaderboard_results");
const close_leaderboard = document.getElementById("close_leaderboard");
const overlay = document.getElementById("overlay");

// detects if any of the level buttons are clicked
leaderboard?.addEventListener("click", (event) => { 
    const buttons = document.querySelectorAll(".level_switch");      
    const button = event.target as HTMLElement;    
    for (let i = 0; i < buttons.length; i++) {        
        buttons[i].classList.remove("focus");
    }
    if(button.tagName === "BUTTON") { 
        button.classList.add("focus");        
        playSound(select_sound);        
        displayLeaderboard(parseInt(Array.from(button.id.toString())[0], 10));        
    }        
});

// open a leaderboard with default display of difficulty level 3
leaderboard_btn?.addEventListener("click", () => {    
    const buttons = document.querySelectorAll(".level_switch");     
    buttons[0].classList.add("focus");
    if (!ui_state.open_leaderboard && leaderboard && overlay) {
        playSound(select_sound);
        overlay.classList.remove("hidden");
        leaderboard.style.display = "flex";
        ui_state.open_leaderboard = !ui_state.open_leaderboard;
        displayLeaderboard(3);
    }
});

// close leaderboard
close_leaderboard?.addEventListener("click", () => {    
    if (leaderboard && ui_state.open_leaderboard && overlay) {
        playSound(select_sound); 
        leaderboard.style.display = "none";
        ui_state.open_leaderboard = !ui_state.open_leaderboard;
        overlay.classList.add("hidden");
    }    
});

// save the result to a leaderboard
export function saveToLeaderboard(level: number, score: number) {
     const leaderboard_results: LeaderboardState[] = JSON.parse(localStorage.getItem("results") || "[]");
     leaderboard_results.push({level, score});
     leaderboard_results.sort((a, b) => a.score - b.score);
     localStorage.setItem("results", JSON.stringify(leaderboard_results));
}

// returns leaderboard data
function getLeaderboard(level: number): LeaderboardState[] {
    const leaderboard_results: LeaderboardState[] = JSON.parse(localStorage.getItem("results") || "[]");
    return leaderboard_results.filter(e => e.level === level).splice(0, 25);
}

// checks a player rank in comparison to other entries on leaderboard
export function getPlayerRank(player_moves: number, level: number): number {
    const leaderboard_results = getLeaderboard(level);
    return leaderboard_results.filter(e => e.score <= player_moves).length;
}

function displayLeaderboard(level: number) {
    const leaderboard_results = getLeaderboard(level).splice(0, 25);
    if (leaderboard_res && leaderboard_results.length !== 0) { 
        leaderboard_res.innerHTML = `<div class="leaderboard_result"><p>Rank</p><p>Result (moves made)</p></div>`;
        for (let i = 0; i < leaderboard_results.length; i++) {            
            leaderboard_res.innerHTML += `<div class="leaderboard_result"><p>${i+1}</p><p>${leaderboard_results[i].score}</p></div>`;
        }
    } else if (leaderboard_res) {
        leaderboard_res.innerHTML = "No record set yet! be the one to do it :)";
    }
}