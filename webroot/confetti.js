
/** Function to create confetti */
export function createConfetti() {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.setProperty("--hue", Math.random()); // Random color
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDuration = (Math.random() * 3 + 2) + "s";
    document.body.appendChild(confetti);

    setTimeout(() => {
        confetti.remove();
    }, 2400);
}

/** Function to create stars */
export function createStar() {
    const star = document.createElement("div");
    star.classList.add("star");
    star.style.left = Math.random() * 100 + "vw";
    star.style.top = Math.random() * 100 + "vh";
    star.style.animationDuration = (Math.random() * 3 + 2) + "s";
    document.body.appendChild(star);

    setTimeout(() => {
        star.remove();
    }, 2400);
}

/** Function to Start Animations */
export function startConfettiAnimations() {
    createConfetti();
    createStar();
}
