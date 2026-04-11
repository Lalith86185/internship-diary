function renderOutput(text) {
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = "";
    
    // Split the AI response by the DATE: marker
    const blocks = text.split(/DATE:/i).filter(b => b.trim().length > 10);

    blocks.forEach(block => {
        // Use regex to separate the Date, Work Summary, and Learning Outcome
        const dateMatch = block.match(/^(.*?)(\n|$)/);
        const workMatch = block.match(/WORK:(.*?)(LEARN:|$)/s);
        const learnMatch = block.match(/LEARN:(.*)/s);

        const date = dateMatch ? dateMatch[1].trim() : "Date";
        const work = workMatch ? workMatch[1].trim() : "Generating work summary...";
        const learn = learnMatch ? learnMatch[1].trim() : "Generating learning outcome...";

        const dayHTML = `
            <div class="day-header">${date.replace(/\*/g, '')}</div>
            
            <div class="sketch-card">
                <span class="label-small">work summary:</span>
                <span class="big-blue-text">${work}</span>
                <button class="copy-btn-centered" onclick="copyText('${work.replace(/'/g, "\\'")}', this)">Copy</button>
            </div>

            <div class="sketch-card">
                <span class="label-small">learning/outcome:</span>
                <span class="big-blue-text">${learn}</span>
                <button class="copy-btn-centered" onclick="copyText('${learn.replace(/'/g, "\\'")}', this)">Copy</button>
            </div>
        `;
        outputDiv.innerHTML += dayHTML;
    });
}

// Copy helper function
function copyText(val, btn) {
    navigator.clipboard.writeText(val).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "COPIED!";
        btn.style.borderColor = "#28a745";
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.borderColor = "#333";
        }, 1500);
    });
}
