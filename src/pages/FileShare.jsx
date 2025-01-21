import { useState, useEffect } from "react";
import io from "socket.io-client";
import api from "../services/api";

const socket = io("https://project-backend-grqo.onrender.com");

function FileShare() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // Fetch files when the component loads
    const fetchFiles = async () => {
      try {
        const { data } = await api.get("/files");
        setFiles(data);
      } catch (err) {
        console.error("Failed to fetch files:", err);
      }
    };

    fetchFiles();

    socket.on("fileUploaded", (newFile) => {
      setFiles((prevFiles) => [...prevFiles, newFile]);
    });

    return () => socket.off("fileUploaded");
  }, []);

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleFileUpload = async () => {
    if (!selectedFile) return alert("Please select a file!");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const { data } = await api.post("/files/upload", formData);
      alert("File uploaded successfully!");
      setSelectedFile(null);
    } catch (err) {
      console.error("Failed to upload file:", err);
      alert("File upload failed!");
    }
  };

  return (
    <div>
      <h1>File Sharing</h1>
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload}>Upload File</button>
      </div>
      <ul>
        {files.map((file) => (
          <li key={file._id}>
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              {file.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FileShare;
