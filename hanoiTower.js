var winnning_condition = [1, 2, 3];
var towers = [[1, 2, 3], [], []];
var difficulty_level = 3; // default level
var tower_index = 0; // stores the index of the currently selected tower, 1 is default
var selected_tower_index = 0; // stores the index pf the tower from which the disk is selected
var tower_selected = false;
var moves = 0; // how many moves are made to reach the goal, default 0
var level_element = document.getElementById("difficulty_level");
var increase_btn = document.getElementById("increase_level");
var decrease_btn = document.getElementById("decrease_level");
setDifficultyLevel();
createTower();
updateMoveCount();
increase_btn === null || increase_btn === void 0 ? void 0 : increase_btn.addEventListener("click", function () {
    if (difficulty_level < 6) {
        difficulty_level++;
        setDifficultyLevel();
    }
});
decrease_btn === null || decrease_btn === void 0 ? void 0 : decrease_btn.addEventListener("click", function () {
    if (difficulty_level > 3) {
        difficulty_level--;
        setDifficultyLevel();
    }
});
// event listener for keyboard controls, left code - 37, right code - 39
document.addEventListener("keydown", function (e) {
    var prev_index;
    if (e.key === "ArrowLeft") {
        if (tower_index > 0) {
            prev_index = tower_index; // remember the tower before the new hovered one to remove styles
            tower_index--;
            navigateToTheTower(prev_index);
        }
    }
    else if (e.key === "ArrowRight") {
        if (tower_index < 2) {
            prev_index = tower_index;
            tower_index++;
            navigateToTheTower(prev_index);
        }
    }
    else if (e.key === " ") {
        if (tower_selected) {
            moveDisk(selected_tower_index, tower_index);
            moves++;
            updateMoveCount();
        }
        else if (towers[tower_index].length !== 0) {
            tower_selected = !tower_selected;
            selected_tower_index = tower_index;
        }
    }
});
// create the body for the starting tower with n-disks
function createTower() {
    var currentelement = document.getElementById("disks_tower_1");
    if (currentelement) {
        currentelement.innerHTML = '';
        for (var i = difficulty_level; i > 0; i--) {
            currentelement.innerHTML += "<img src=\"arts/default/".concat(towers[0][i - 1], ".png\" class=\"disk disk_").concat(i, "\">");
        }
    }
}
function updateTower(from_tower, to_tower, from, to) {
    var disk = from_tower.children[0];
    from_tower.children[0].remove();
    to_tower.innerHTML = '';
    for (var i = towers[to].length; i > 0; i--) {
        console.log(i);
        to_tower.innerHTML += "<img src=\"arts/default/".concat(towers[to][i - 1], ".png\" class=\"disk_").concat(towers[to][i - 1], "\">");
    }
}
// update the difficulty level
function setDifficultyLevel() {
    if (level_element) {
        level_element.textContent = difficulty_level.toString();
        if (difficulty_level !== towers[0].length) {
            if (difficulty_level > towers[0].length) {
                towers[0].push(difficulty_level);
                winnning_condition.push(difficulty_level);
                createTower();
            }
            else if (difficulty_level < towers[0].length) {
                towers[0].pop();
                winnning_condition.pop();
                createTower();
            }
        }
    }
}
// select a tower with keys on a keyboard
function navigateToTheTower(prev_index) {
    var hover_tower_top = document.getElementById("rt".concat(tower_index + 1));
    var hover_tower_bottom = document.getElementById("rb".concat(tower_index + 1));
    var prev_tower_top = document.getElementById("rt".concat(prev_index + 1));
    var prev_tower_bottom = document.getElementById("rb".concat(prev_index + 1));
    var current_stack = document.getElementById("disks_tower_".concat(tower_index + 1));
    var prev_stack = document.getElementById("disks_tower_".concat(prev_index + 1));
    console.log();
    /*if (hover_tower_top && hover_tower_bottom && prev_tower_bottom && prev_tower_top) {
        
        hover_tower_top.src = "arts/hover/rod_top.png";
        hover_tower_bottom.src = "arts/hover/rod_bottom.png";
        prev_tower_top.src = "arts/default/rod_top.png";
        prev_tower_bottom.src = "arts/default/rod_bottom.png";
    }
    if (current_stack?.hasChildNodes()) {
        for (let i = current_stack.childElementCount; i > 0; i--) {
            const child = current_stack.children[i] as HTMLImageElement;
            console.log(child);
            if (child instanceof HTMLImageElement) {
                child.src = `arts/hover/${i+1}.png`;
            }
        }
    }
    if (prev_stack?.hasChildNodes()) {
        for (let i = 0; i < prev_stack.childElementCount; i++) {
            const child = prev_stack.children[i] as HTMLImageElement;
            if (child instanceof HTMLImageElement) {
                child.src = `arts/default/${prev_index+1}`;
            }
        }
    }*/
}
function moveDisk(from, to) {
    var currentelement = document.getElementById("disks_tower_".concat(from + 1));
    var move_to = document.getElementById("disks_tower_".concat(to + 1));
    if (currentelement && move_to) {
        if (towers[from][towers[from].length - 1] > towers[to][towers[to].length - 1] || towers[to].length === 0) {
            var removed_disk = towers[from].pop();
            towers[to].push(removed_disk);
            tower_selected = !tower_selected;
            updateTower(currentelement, move_to, from, to);
            reachGoal();
        }
    }
}
function reachGoal() {
    if (towers[towers.length - 1].every(function (e, i) { return e === winnning_condition[i]; })
        && towers[towers.length - 1].length === winnning_condition.length) {
        console.log("Goal is reached!");
        return;
    }
}
function updateMoveCount() {
    var current_element = document.getElementById("moves_count");
    if (current_element) {
        current_element.textContent = moves.toString();
    }
}
