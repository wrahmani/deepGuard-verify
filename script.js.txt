const { createFFmpeg, fetchFile } = FFmpeg;
let ffmpeg;

async function initFFmpeg() {
    ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    console.log("FFmpeg loaded!");
}

let model;
async function loadModel() {
    model = await tf.loadGraphModel(
        "https://storage.googleapis.com/deepguard-basic/model.json"
    );
    console.log("AI Model loaded!");
}

async function processImage(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const tensor = tf.browser
                .fromPixels(img)
                .resizeNearestNeighbor([256, 256])
                .toFloat()
                .div(255.0)
                .expandDims();
            resolve(tensor);
        };
        img.src = URL.createObjectURL(file);
    });
}

async function extractFrames(videoFile, frameCount = 5) {
    const frames = [];
    ffmpeg.FS("writeFile", "input.mp4", await fetchFile(videoFile));
    await ffmpeg.run("-i", "input.mp4", "-vf", "fps=1", "frame-%d.png");
    
    for(let i = 1; i <= frameCount; i++) {
        try {
            const frameName = `frame-${i}.png`;
            if(ffmpeg.FS("readdir", "/").includes(frameName)) {
                const data = ffmpeg.FS("readFile", frameName);
                frames.push(new Blob([data.buffer], { type: "image/png" }));
            }
        } catch(e) {
            console.log(`Stopped at frame ${i}`);
            break;
        }
    }
    return frames;
}

async function detectDeepfake(file) {
    const fileType = file.type.split("/")[0];
    let predictions = [];
    
    if (fileType === "image") {
        const tensor = await processImage(file);
        const pred = model.predict(tensor);
        predictions = [pred.dataSync()[0]];
    } 
    else if (fileType === "video") {
        const frames = await extractFrames(file, 5);
        for(const frame of frames) {
            const tensor = await processImage(frame);
            const pred = model.predict(tensor);
            predictions.push(pred.dataSync()[0]);
        }
    }
    
    const avgConfidence = predictions.reduce((a, b) => a + b, 0) / predictions.length;
    return avgConfidence;
}

document.getElementById("detectBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("mediaInput");
    const file = fileInput.files[0];
    
    if (!file) {
        alert("कृपया कोई फोटो या वीडियो चुनें");
        return;
    }
    
    document.getElementById("resultText").textContent = "जाँच चल रही है... ⏳";
    document.getElementById("confidenceBar").style.width = "0%";
    document.getElementById("confidenceValue").textContent = "विश्वास: 0%";
    
    try {
        const confidence = await detectDeepfake(file);
        const isFake = confidence > 0.7;
        const resultText = isFake ? 
            `⚠️ चेतावनी: ${Math.round(confidence*100)}% संभावना से नकली` : 
            `✅ असली मीडिया (${Math.round((1-confidence)*100)}% विश्वास)`;
        
        document.getElementById("resultText").textContent = resultText;
        document.getElementById("confidenceBar").style.width = `${confidence*100}%`;
        document.getElementById("confidenceValue").textContent = 
            `विश्वास: ${Math.round(confidence*100)}%`;
        
    } catch (error) {
        document.getElementById("resultText").textContent = "त्रुटि: जाँच असफल रही";
    }
});

window.addEventListener("load", async () => {
    try {
        document.getElementById("resultText").textContent = "तैयार हो रहा है...";
        await initFFmpeg();
        await loadModel();
        document.getElementById("resultText").textContent = "तैयार! फाइल अपलोड करें";
    } catch (e) {
        document.getElementById("resultText").textContent = "त्रुटि: AI लोड नहीं हुआ";
    }
});