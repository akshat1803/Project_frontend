import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import io from "socket.io-client";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("https://project-backend-grqo.onrender.com", {
      auth: {
        token: user?.token
      }
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setError("Real-time connection failed");
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user?.token]);

  const validateFile = (file) => {
    // List of allowed file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("File type not supported");
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size exceeds 10 MB");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError("");
    
    if (selectedFile) {
      try {
        validateFile(selectedFile);
        setFile(selectedFile);
      } catch (err) {
        setError(err.message);
        setFile(null);
        e.target.value = ''; // Reset file input
      }
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError("Please select a file!");
      return;
    }

    if (!user?.token) {
      setError("You must be logged in to upload files");
      return;
    }

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://project-backend-grqo.onrender.com/api/files/upload",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();
      
      // Emit upload event through socket
      if (socket?.connected) {
        socket.emit("fileUploaded", {
          ...data,
          userId: user.id
        });
      }

      // Reset form
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      // Show success message
      alert("File uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
            className="w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {file && (
            <div className="mt-2 text-sm text-gray-500">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          onClick={handleFileUpload}
          disabled={isUploading || !file}
          className={`w-full py-2 px-4 rounded-md ${
            isUploading || !file
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isUploading ? (
            <span>Uploading... Please wait</span>
          ) : (
            <span>Upload File</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default FileUpload;