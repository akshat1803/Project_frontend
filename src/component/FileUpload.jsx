import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import io from "socket.io-client";

const socket = io("https://project-backend-grqo.onrender.com");

function FileUpload() {
  const [file, setFile] = useState(null);
  const { user } = useContext(AuthContext); 
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file!");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10 MB.");
      return;
    }

    if (!user?.token) {
      alert("You must be logged in to upload files.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    try {
      const response = await fetch(
        "https://project-backend-grqo.onrender.com/api/files/upload",
        {
          method: "POST",
          body: formData,
          withCredentials: true
          
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "File upload failed");
      }

      const data = await response.json();
      alert("File uploaded successfully!");
      socket.emit("fileUploaded", data);
    } catch (err) {
      console.error("File upload error:", err.message);
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

export default FileUpload;
