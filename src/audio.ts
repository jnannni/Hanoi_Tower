export const select_sound:HTMLAudioElement = new Audio("sounds/selection_sound.wav");
export const navigation_sound: HTMLAudioElement = new Audio("sounds/navigation.wav");
export const win_sound: HTMLAudioElement = new Audio("sounds/win_sound.ogg");

export function playSound(sound: HTMLAudioElement) {
    sound.pause();
    sound.currentTime = 0;
    sound.play();
}