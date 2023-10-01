import './App.css'
import React from "react";

const chunkFile = (file, chunkSize) => {
    const chunks = [];
    let offset = 0;
    while (offset < file.size) {
        chunks.push(file.slice(offset, offset + chunkSize));
        offset += chunkSize;
    }
    return chunks;
}
async function uploadChunks (file) {
    const chunkSize = 1024 * 1024; // 1MB
    const chunks = chunkFile(file, chunkSize);

    const response = await fetch('http://localhost:8000/api/video/start-chunk');
    const {sessionId} = await response.json();

    for (let i = 0; i < chunks.length; i++) {
        await fetch('http://localhost:8000/api/video/upload-chunk', {
            method: 'POST',
            body: chunks[i],
            headers: {
                'Content-Type': 'application/octet-stream',
                'Chunk-Number': i + 1,
                'Session-Id': sessionId,
            }
        })
    }

    await fetch('http://localhost:8000/api/video/assemble-chunks', {
        method: 'POST',
        body: JSON.stringify({sessionId: sessionId}),
        headers: {
            'Content-Type': 'application/json',
        }
    })
}
function App() {
  const fileInputRef = React.useRef(null);
  const handleUploadClick = async () => {
      const file = fileInputRef.current.files[0];
      if (file){
          await uploadChunks(file);
      }
  }
  return (
    <div>
        <input type="file" ref={fileInputRef} accept="video/*"/>
        <button onClick={handleUploadClick}> Upload</button>
    </div>
  )
}

export default App
