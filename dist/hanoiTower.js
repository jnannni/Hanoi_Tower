import { saveToLeaderboard, getPlayerRank } from "./leaderboard.js";
import { select_sound, navigation_sound, win_sound, playSound } from "./audio.js";
export let game_state = {
    towers: [[1, 2, 3], [], []],
    moves: 0,
    difficulty_level: 3,
    selected_tower_index: 0,
    is_tower_selected: false,
    is_game_entered: false,
    is_game_started: false,
    timer: {
        minutes: 0,
        seconds: 0,
    },
};
export const ui_state = {
    open_rules: false,
    open_leaderboard: false,
};
const winnning_condition = [1, 2, 3];
let tower_index = 0;
const default_game_state = JSON.parse(JSON.stringify(game_state));
let interval;
let prev_index = 0;
const overlay = document.getElementById("overlay");
const instruction = document.getElementById("instruction");
const stopwatch = document.getElementById("stopwatch");
const level_element = document.getElementById("difficulty_level");
const increase_btn = document.getElementById("increase_level");
const decrease_btn = document.getElementById("decrease_level");
const restart_btn = document.getElementById("restart");
const restart_btn_2 = document.getElementById("restart_2");
const enter_game = document.getElementById("enter_game_btn");
const win_alert = document.getElementById("win_alert");
startingState();
enter_game === null || enter_game === void 0 ? void 0 : enter_game.addEventListener("click", () => {
    playSound(select_sound);
    const game_options = document.getElementById("options");
    enter_game.style.display = "none";
    if (game_options) {
        if (game_options && game_options.parentElement && instruction) {
            instruction.style.display = "block";
            game_options.parentElement.style.justifyContent = "space-between";
            game_options.style.display = "flex";
        }
    }
});
increase_btn === null || increase_btn === void 0 ? void 0 : increase_btn.addEventListener("click", () => {
    if (game_state.difficulty_level < 6) {
        playSound(navigation_sound);
        game_state.difficulty_level++;
        setDifficultyLevel();
        increase_btn.blur();
    }
});
decrease_btn === null || decrease_btn === void 0 ? void 0 : decrease_btn.addEventListener("click", () => {
    if (game_state.difficulty_level > 3) {
        playSound(navigation_sound);
        game_state.difficulty_level--;
        setDifficultyLevel();
        decrease_btn.blur();
    }
});
restart_btn === null || restart_btn === void 0 ? void 0 : restart_btn.addEventListener("click", () => {
    playSound(select_sound);
    gameRestart();
    restart_btn.blur();
});
restart_btn_2 === null || restart_btn_2 === void 0 ? void 0 : restart_btn_2.addEventListener("click", () => {
    playSound(select_sound);
    gameRestart();
    restart_btn_2.blur();
});
document.addEventListener("keydown", (e) => {
    let current_stack = document.getElementById(`disks_tower_${tower_index + 1}`);
    let prev_stack = document.getElementById(`disks_tower_${game_state.selected_tower_index + 1}`);
    if (e.key === "ArrowLeft" && game_state.is_game_started) {
        if (tower_index > 0) {
            playSound(navigation_sound);
            prev_index = tower_index;
            tower_index--;
            navigateToTheTower();
        }
    }
    else if (e.key === "ArrowRight" && game_state.is_game_started) {
        if (tower_index < 2) {
            playSound(navigation_sound);
            prev_index = tower_index;
            tower_index++;
            navigateToTheTower();
        }
    }
    else if (e.key === " " && game_state.is_game_started) {
        if (game_state.is_tower_selected) {
            playSound(select_sound);
            game_state.moves++;
            moveDisk(game_state.selected_tower_index, tower_index);
            updateMoveCount();
            if (prev_stack === null || prev_stack === void 0 ? void 0 : prev_stack.hasChildNodes()) {
                for (let i = prev_stack.childElementCount; i > 0; i--) {
                    const child = prev_stack.children[i - 1];
                    if (child instanceof HTMLImageElement) {
                        console.log(child);
                        child.src = `arts/default/${child.classList[1].slice(-1)}.png`;
                    }
                }
            }
        }
        else if (game_state.towers[tower_index].length !== 0) {
            playSound(select_sound);
            if (current_stack === null || current_stack === void 0 ? void 0 : current_stack.hasChildNodes()) {
                for (let i = current_stack.childElementCount; i > 0; i--) {
                    const child = current_stack.children[i - 1];
                    if (child instanceof HTMLImageElement) {
                        child.src = `arts/hover/${child.classList[1].slice(-1)}.png`;
                    }
                }
            }
            game_state.is_tower_selected = !game_state.is_tower_selected;
            game_state.selected_tower_index = tower_index;
        }
    }
    else if ((e.key === " " && !game_state.is_game_started)) {
        gameStart();
    }
});
function startingState() {
    const game_options = document.getElementById("options");
    if (game_options && game_options.parentElement && instruction) {
        instruction.style.display = "none";
        game_options.parentElement.style.justifyContent = "center";
        game_options.style.display = "none";
    }
    setDifficultyLevel();
    createTower();
    updateMoveCount();
}
function gameStart() {
    const starting_tower_top = document.getElementById("rt1");
    const starting_tower_bottom = document.getElementById("rb1");
    if (instruction && increase_btn && decrease_btn && starting_tower_top && starting_tower_bottom) {
        starting_tower_top.src = "arts/hover/rod_top.png";
        starting_tower_bottom.src = "arts/hover/rod_bottom.png";
        decrease_btn.style.opacity = "0";
        decrease_btn.style.pointerEvents = "none";
        increase_btn.style.opacity = "0";
        increase_btn.style.pointerEvents = "none";
        instruction.style.display = "none";
    }
    interval = setInterval(updateTimer, 1000);
    game_state.is_game_started = !game_state.is_game_started;
}
function createTower() {
    let disk_stacks = document.getElementsByClassName("disks_stack");
    let currentelement = document.getElementById("disks_tower_1");
    if (disk_stacks) {
        for (let i = 0; i < disk_stacks.length; i++) {
            disk_stacks[i].innerHTML = '';
        }
    }
    if (currentelement) {
        for (let i = game_state.difficulty_level; i > 0; i--) {
            currentelement.innerHTML += `<img src="arts/default/${game_state.towers[0][i - 1]}.png" class="disk disk_${i}">`;
        }
    }
}
function updateTower(from_tower, to_tower, from, to) {
    const disk = from_tower.children[0];
    from_tower.children[0].remove();
    to_tower.innerHTML = '';
    for (let i = game_state.towers[to].length; i > 0; i--) {
        to_tower.innerHTML += `<img src="arts/default/${game_state.towers[to][i - 1]}.png" class="disk disk_${game_state.towers[to][i - 1]}">`;
    }
}
function setDifficultyLevel() {
    if (level_element) {
        level_element.textContent = game_state.difficulty_level.toString();
        if (game_state.difficulty_level !== game_state.towers[0].length) {
            if (game_state.difficulty_level > game_state.towers[0].length) {
                game_state.towers[0].push(game_state.difficulty_level);
                winnning_condition.push(game_state.difficulty_level);
                createTower();
            }
            else if (game_state.difficulty_level < game_state.towers[0].length) {
                game_state.towers[0].pop();
                winnning_condition.pop();
                createTower();
            }
        }
    }
}
function navigateToTheTower() {
    const hover_tower_top = document.getElementById(`rt${tower_index + 1}`);
    const hover_tower_bottom = document.getElementById(`rb${tower_index + 1}`);
    const prev_tower_top = document.getElementById(`rt${prev_index + 1}`);
    const prev_tower_bottom = document.getElementById(`rb${prev_index + 1}`);
    console.log();
    if (game_state.is_game_started && hover_tower_top && hover_tower_bottom && prev_tower_bottom && prev_tower_top) {
        hover_tower_top.src = "arts/hover/rod_top.png";
        hover_tower_bottom.src = "arts/hover/rod_bottom.png";
        prev_tower_top.src = "arts/default/rod_top.png";
        prev_tower_bottom.src = "arts/default/rod_bottom.png";
    }
}
function moveDisk(from, to) {
    let currentelement = document.getElementById(`disks_tower_${from + 1}`);
    let move_to = document.getElementById(`disks_tower_${to + 1}`);
    if (currentelement && move_to) {
        if (game_state.towers[from][game_state.towers[from].length - 1] > game_state.towers[to][game_state.towers[to].length - 1] || game_state.towers[to].length === 0) {
            const removed_disk = game_state.towers[from].pop();
            game_state.towers[to].push(removed_disk);
            game_state.is_tower_selected = !game_state.is_tower_selected;
            updateTower(currentelement, move_to, from, to);
            reachGoal();
        }
    }
}
function reachGoal() {
    const win_message = document.getElementById("win_message");
    if (game_state.towers[game_state.towers.length - 1].every((e, i) => e === winnning_condition[i])
        && game_state.towers[game_state.towers.length - 1].length === winnning_condition.length) {
        saveToLeaderboard(game_state.difficulty_level, game_state.moves);
        const player_rank = getPlayerRank(game_state.moves, game_state.difficulty_level);
        if (win_message && win_alert && overlay) {
            win_message.innerHTML = `<p class="message">Your position on Difficulty ${game_state.difficulty_level} leaderboard 
                is ${player_rank} with the score: ${game_state.moves}</p>`;
            win_alert.classList.remove("hidden");
            overlay.classList.remove("hidden");
        }
        game_state.is_game_started = !game_state.is_game_started;
        playSound(win_sound);
        clearInterval(interval);
        return;
    }
}
function updateMoveCount() {
    const current_element = document.getElementById("moves_count");
    if (current_element) {
        current_element.textContent = game_state.moves.toString();
    }
}
function updateTime() {
    if (stopwatch) {
        stopwatch.textContent = "00:00";
    }
}
function gameRestart() {
    clearInterval(interval);
    game_state = JSON.parse(JSON.stringify(default_game_state));
    setDifficultyLevel();
    updateMoveCount();
    updateTime();
    createTower();
    if (instruction && increase_btn && decrease_btn && win_alert && overlay) {
        instruction.style.display = "block";
        decrease_btn.style.opacity = "100";
        decrease_btn.style.pointerEvents = "auto";
        increase_btn.style.opacity = "100";
        increase_btn.style.pointerEvents = "auto";
        win_alert.classList.add("hidden");
        overlay.classList.add("hidden");
    }
}
function updateTimer() {
    game_state.timer.seconds++;
    if (game_state.timer.seconds === 60) {
        game_state.timer.minutes++;
        game_state.timer.seconds = 0;
    }
    if (stopwatch) {
        stopwatch.textContent = `${game_state.timer.minutes.toString().padStart(2, '0')}:${game_state.timer.seconds.toString().padStart(2, '0')}`;
    }
}
