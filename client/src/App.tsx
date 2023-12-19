import { useCallback, useEffect, useState } from "react";
import FileUploader from "./components/FileUploader";
import FileList from "./components/FileList";
import { API_URL } from "./constants";

const App = () => {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [storedFiles, setStoredFiles] = useState<string[]>([]);

  const handleFileUpload = (files: File[]) => {
    setFilesToUpload(files);
  };

  const uploadToServer = async () => {
    if (!filesToUpload.length) return;
    try {
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append(`files`, file);
      });
      await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData
      })
      setFilesToUpload([])
      fetchFiles()
    } catch (error) {
      console.error("Error during files upload:", error)
    }
  }

  const fetchFiles = useCallback(async () => {
    const response = await fetch(`${API_URL}/files`)
    const files = await response.json()
    setStoredFiles(files.files)
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  return (
    <div className="container">
      <h1>FileShare System</h1>
      <div className="sections">
        <aside>
          <h2>Files</h2>
          <FileList files={storedFiles} fetchFiles={fetchFiles} />
        </aside>
        <main>
          <FileUploader onFileUpload={handleFileUpload} />
          <div>
            <h2>Files to Upload:</h2>
            <ul>
              {filesToUpload.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
            <button disabled={!filesToUpload.length} onClick={uploadToServer}>Upload</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
