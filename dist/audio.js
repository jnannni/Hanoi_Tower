export const select_sound = new Audio("sounds/selection_sound.wav");
export const navigation_sound = new Audio("sounds/navigation.wav");
export const win_sound = new Audio("sounds/win_sound.ogg");
export function playSound(sound) {
    sound.pause();
    sound.currentTime = 0;
    sound.play();
}
