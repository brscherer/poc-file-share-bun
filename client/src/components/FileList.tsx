import { MouseEvent, useEffect, useState } from "react";
import { API_URL } from "../constants";

interface FileListProps {
  files: string[];
  fetchFiles: () => void;
}

const FileList: React.FC<FileListProps> = ({ files, fetchFiles }) => {
  const [search, setSearch] = useState<string>("");
  const [result, setResult] = useState<string[]>([]);

  const dataSource: string[] = result.length ? result : files;

  const handleFileDownload = async (fileName: string) => {
    try {
      const response = await fetch(`${API_URL}/file/${fileName}`, {
        method: "GET",
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
      } else {
        console.error("Error downloading file:", response.statusText);
      }
    } catch (error) {
      console.error("Error during files download:", error);
    }
  };

  const handleFileDelete = async (
    e: MouseEvent<HTMLSpanElement, MouseEvent>,
    fileName: string
  ) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this file?")) {
      try {
        const response = await fetch(`${API_URL}/delete/${fileName}`, {
          method: "DELETE",
        });
        if (response.ok) {
          fetchFiles();
          alert("File deleted successfully");
        } else {
          console.error("Error deleting file:", response.statusText);
        }
      } catch (error) {
        console.error("Error during files download:", error);
      }
    }
  };

  useEffect(() => {
    setResult(files.filter(f => f.includes(search)))
  }, [files, search])

  return (
    <>
      <div className="search">
        <input type="text" placeholder="Search files" onChange={(e) => setSearch(e.target.value)} />
      </div>
      {dataSource.length > 0 ? (
        <ul>
          {dataSource.map((file, index) => (
            <li key={index} className="clickable file-list">
              <div onClick={() => handleFileDownload(file)}>
                <span>📄</span>
                <span style={{ marginLeft: 16 }}>{file}</span>
              </div>
              <span onClick={(e) => handleFileDelete(e, file)}>🗑️</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Not found any stored files</p>
      )}
    </>
  );
};

export default FileList;
