import { saveToLeaderboard, getPlayerRank } from "./leaderboard.js";
import { select_sound, navigation_sound, win_sound, playSound } from "./audio.js";
import { displayRules } from "./rules.js";

// game state stores the current (!) state of the game parameters
export let game_state = {
    towers: [[1, 2, 3], [], []],
    moves: 0,
    difficulty_level: 3, // game's level that equals the number of disks on the rod, default (and min) is 3
    selected_tower_index: 0, // stores the index pf the tower from which the disk is selected
    is_tower_selected: false,
    is_game_entered: false,
    is_game_started: false,
    timer: {
        minutes: 0,
        seconds: 0,
    },
};

// state used fot opening/closing floating elements (leaderboard, rules)
export const ui_state = {
    open_rules: false,
    open_leaderboard: false,
};

const winnning_condition = [1, 2, 3];
let tower_index = 0; // stores the index of the currently selected tower, 1st tower is a default tower (0)
const default_game_state = JSON.parse(JSON.stringify(game_state)); // saves the game state at the beginning of the game
let interval: number | NodeJS.Timeout;
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

// shows the layout after entering the game, basically a switch to a game state
enter_game?.addEventListener("click", () => {
    playSound(select_sound);
    const game_options = document.getElementById("options");
    enter_game.style.display = "none";
    if (game_options && game_options.parentElement && instruction) {
        instruction.style.display = "block";
        game_options.parentElement.style.justifyContent = "space-between";
        game_options.style.display = "flex";
    }
})

// increase difficulty level/number of disks on the road
increase_btn?.addEventListener("click", () => {
    if (game_state.difficulty_level < 6) {
        playSound(navigation_sound);
        game_state.difficulty_level++;
        setDifficultyLevel();
        increase_btn.blur();
    }
});

// decrease difficulty level/number of disks on the road
decrease_btn?.addEventListener("click", () => {
    if (game_state.difficulty_level > 3) {
        playSound(navigation_sound);
        game_state.difficulty_level--;
        setDifficultyLevel();
        decrease_btn.blur();
    }
});

// restart the game and reset the game parameteres to their default state (difficulty level, moves count, timer)
restart_btn?.addEventListener("click", () => {
    playSound(select_sound);
    gameRestart();
    restart_btn.blur();
});

// restart the game after winning and reset the game parameteres to their default state (difficulty level, moves count, timer)
restart_btn_2?.addEventListener("click", () => {
    playSound(select_sound);
    gameRestart();
    restart_btn_2.blur();
});

// event listener for keyboard controls (right, left, space)
document.addEventListener("keydown", (e) => {   
    if (e.key === "ArrowLeft" && game_state.is_game_started) {
        leftArrowControl();
    } else if (e.key === "ArrowRight" && game_state.is_game_started) {
        rightArrowControl();
    } else if (e.key === " " && game_state.is_game_started) {
        if (game_state.is_tower_selected) {
            makeMove();
        } else if (game_state.towers[tower_index].length !== 0) { 
            changeImgToHover();            
        }
    } else if ((e.key === " " && !game_state.is_game_started)) {                        
        gameStart();
    }
});

// control of the left arrow, move to the left when pressed
function leftArrowControl() {
    if (tower_index > 0) {            
        playSound(navigation_sound);
        prev_index = tower_index; // remember the tower before the new hovered one to remove styles
        tower_index--;                        
        navigateToTheTower();
    }
}

// control of the right arrow, move to the right when pressed
function rightArrowControl() {
    if (tower_index < 2) {
        playSound(navigation_sound);
        prev_index = tower_index;
        tower_index++;                      
        navigateToTheTower();                                
    }
}

// make a move by updating move count and moving the top disk to a chosen tower 
function makeMove() {        
    playSound(select_sound);
    game_state.moves++;                                  
    moveDisk(game_state.selected_tower_index, tower_index);                        
    updateMoveCount();    
}

// change disks' images to default state when the tower is not selected
function changeImgToDefault() {
    const prev_stack = document.getElementById(`disks_tower_${game_state.selected_tower_index+1}`); 
    if (prev_stack?.hasChildNodes())  {                 
        for (let i = prev_stack.childElementCount; i > 0; i--) {
            const child = prev_stack.children[i-1] as HTMLImageElement;                            
            if (child instanceof HTMLImageElement) {  
                console.log(child);                              
                child.src = `arts/default/${child.classList[1].slice(-1)}.png`;
            }
        }
    }
}

// change disks' images to hover state when the tower is selected
function changeImgToHover() {
    const current_stack = document.getElementById(`disks_tower_${tower_index+1}`);
    playSound(select_sound);                           
    if (current_stack?.hasChildNodes())  {                 
        for (let i = current_stack.childElementCount; i > 0; i--) {
            const child = current_stack.children[i-1] as HTMLImageElement;                            
            if (child instanceof HTMLImageElement) {                                                       
                child.src = `arts/hover/${child.classList[1].slice(-1)}.png`;
            }
        }
    }
    game_state.is_tower_selected = !game_state.is_tower_selected;
    game_state.selected_tower_index = tower_index;
}

// set the starting state for the game
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
    if (!ui_state.open_rules && overlay) {
        overlay.classList.remove("hidden");
        ui_state.open_rules = !ui_state.open_rules;
        displayRules();
    }
}

// starts the game and its counters (moves, timer) itself
function gameStart() {
    const starting_tower_top = document.getElementById("rt1") as HTMLImageElement;
    const starting_tower_bottom = document.getElementById("rb1") as HTMLImageElement;
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

// create the body for the starting tower with n-disks
function createTower() {
    const disk_stacks = document.getElementsByClassName("disks_stack");
    const currentelement = document.getElementById("disks_tower_1"); 
    if (disk_stacks) {
        for (let i = 0; i < disk_stacks.length; i++) {
            disk_stacks[i].innerHTML = '';
        }
    }   
    if (currentelement) {
        for (let i = game_state.difficulty_level; i > 0; i--) {                
            currentelement.innerHTML += `<img src="arts/default/${game_state.towers[0][i-1]}.png" class="disk disk_${i}">`;
        }
    }
}

// update towers' state when a disk is moved
function updateTower(from_tower: HTMLElement, to_tower: HTMLElement, from: number, to: number) {    
    from_tower.children[0].remove();    
    to_tower.innerHTML = '';
    for (let i = game_state.towers[to].length; i > 0; i--) {           
        to_tower.innerHTML += `<img src="arts/default/${game_state.towers[to][i-1]}.png" class="disk disk_${game_state.towers[to][i-1]}">`;        
    }  

}

// update the difficulty level
function setDifficultyLevel() {
    if (level_element) {
        level_element.textContent = game_state.difficulty_level.toString();
        if (game_state.difficulty_level !== game_state.towers[0].length) {
            if (game_state.difficulty_level > game_state.towers[0].length) {
                game_state.towers[0].push(game_state.difficulty_level);
                winnning_condition.push(game_state.difficulty_level);                
                createTower();
            } else if (game_state.difficulty_level < game_state.towers[0].length) {
                game_state.towers[0].pop();
                winnning_condition.pop();                
                createTower();
            }
        }
    }    
}

// select a tower with keys on a keyboard and change rods' state from hover to default accroding to current tower index
function navigateToTheTower() {    
    const hover_tower_top = document.getElementById(`rt${tower_index+1}`) as HTMLImageElement;
    const hover_tower_bottom = document.getElementById(`rb${tower_index+1}`) as HTMLImageElement;
    const prev_tower_top = document.getElementById(`rt${prev_index+1}`) as HTMLImageElement;
    const prev_tower_bottom = document.getElementById(`rb${prev_index+1}`) as HTMLImageElement;    
    if (game_state.is_game_started && hover_tower_top && hover_tower_bottom && prev_tower_bottom && prev_tower_top) {
        
        hover_tower_top.src = "arts/hover/rod_top.png";
        hover_tower_bottom.src = "arts/hover/rod_bottom.png";
        prev_tower_top.src = "arts/default/rod_top.png";
        prev_tower_bottom.src = "arts/default/rod_bottom.png";        
    }    
}

// move disks: both img elements and a number in array
function moveDisk(from: number, to: number) {    
    const currentelement = document.getElementById(`disks_tower_${from+1}`);
    const move_to = document.getElementById(`disks_tower_${to+1}`);    
    if (currentelement && move_to) {
        if (game_state.towers[from][game_state.towers[from].length-1] > game_state.towers[to][game_state.towers[to].length-1] || game_state.towers[to].length === 0) {            
            const removed_disk = game_state.towers[from].pop();  
            if (removed_disk) {
                game_state.towers[to].push(removed_disk);  
            }                                            
            game_state.is_tower_selected = !game_state.is_tower_selected;
            updateTower(currentelement, move_to, from, to);
            reachGoal();            
        } 
    }
}

// checks if the winning condition is reached
function reachGoal () {
    const win_message = document.getElementById("win_message");
    if (game_state.towers[game_state.towers.length-1].every((e, i) => e === winnning_condition[i]) 
        && game_state.towers[game_state.towers.length-1].length === winnning_condition.length) {                        
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

// updates the text content of a div according to moves counter
function updateMoveCount() {    
    const current_element = document.getElementById("moves_count");
    if (current_element) {
        current_element.textContent = game_state.moves.toString();
    }
}

// updates the text content for a timer
function updateTime() {
    if (stopwatch) {
        stopwatch.textContent = "00:00";
    }
}

// reset the game parameters to its default state & changes visibility for html elements
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
