"use client";

interface FileUploadProps {
  uploadStatus: string;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileUpload({
  uploadStatus,
  onFileUpload,
}: FileUploadProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Upload Notes</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload a text file
          </label>
          <input
            type="file"
            accept=".txt,.md"
            onChange={onFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        {uploadStatus && (
          <div
            className={`text-sm ${
              uploadStatus.includes("successfully")
                ? "text-green-600"
                : "text-blue-600"
            }`}
          >
            {uploadStatus}
          </div>
        )}
      </div>
    </div>
  );
}
