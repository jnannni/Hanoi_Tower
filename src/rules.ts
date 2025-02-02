import { ui_state } from "./hanoiTower.js";
import { select_sound, playSound } from "./audio.js";

const rules_btn = document.getElementById("rules_btn");
const overlay = document.getElementById("overlay");
const rules_wrapper = document.getElementById("rules_wrapper");
const rules = document.getElementById("rules");
const close_rules = document.getElementById("close_rules");

rules_btn?.addEventListener("click", () => {  
    if (!ui_state.open_rules && overlay && rules) {
        playSound(select_sound);
        overlay.classList.remove("hidden");        
        ui_state.open_rules = !ui_state.open_rules; 
        displayRules();       
    }
});

close_rules?.addEventListener("click", () => {
    if (rules && ui_state.open_rules && overlay) {
        playSound(select_sound); 
        rules.style.display = "none";
        ui_state.open_rules = !ui_state.open_rules;
        overlay.classList.add("hidden");
    }    
});

export function displayRules() {
    if (rules_wrapper && rules) {
        rules.style.display = "flex";
        rules_wrapper.innerHTML = `<h3>Rules</h3>                    
                            <ul>
                                <li>Move all the disks from the starting tower to the last tower in the fewest moves possible;</li>
                                <li>Only one disk can be moved at a time;</li>
                                <li>A disk can only be placed on top of a larger disk or on an empty tower.</li>
                            </ul>                                                    
                        <h3>Controls</h3>
                            <div class="controls_description">
                                <div class="keyboard_controls">
                                    <h4>Keyboard:</h4>
                                    <ul>
                                        <li>Use the arrow keys (← and →) to navigate between towers;</li>
                                        <li>Press the spacebar to select a top disk or to place a disk.</li>                                    
                                    </ul>
                                </div>
                                <div class="mouse_controls">
                                    <h4>Mouse:</h4>
                                    <ul>
                                        <li><---in progress---></li>                                        
                                    </ul>
                                </div>
                            </div>
                        `
    }
}