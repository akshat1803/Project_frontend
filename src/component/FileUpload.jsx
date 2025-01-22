import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

function FileUpload() {
  const [file, setFile] = useState(null);
  const { user } = useContext(AuthContext);
  const [isUploading, setIsUploading] = useState(false);

  // console.log("user from context", user);

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

    if (!user) {
      alert("You must be logged in to upload files.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    try {
      // const response = await fetch("http://localhost:5000/api/files/upload", {
      //   method: "POST",
      //   body: formData,
      //   headers: {
      //     Authorization: `Bearer ${user.token}`,
      //   },
      // });

      const response = await axios.post(
        "http://localhost:5000/api/files/upload",
        formData,
        { withCredentials: true }
      );

      alert("File uploaded successfully!");
      socket.emit("fileUploaded", response.data);
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
