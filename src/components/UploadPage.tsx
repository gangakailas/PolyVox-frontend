import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Video } from 'lucide-react';

const UploadPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.includes('video')) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      // Auto-navigate after a short delay to show file info
      setTimeout(() => {
        navigate('/workflow', { state: { file: files[0] } });
      }, 1500);
    }
  };

  return (
    <div className="cosmic-bg min-h-screen flex items-center justify-center p-8">
      <div className="wormhole-bg animate-wormhole-spin"></div>
      
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dubverse Audio Flow
        </h1>
        <p className="text-xl text-muted-foreground mb-12">
          Transform your videos with AI-powered dubbing in English
        </p>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
            isDragging
              ? 'border-primary bg-primary/10 scale-105'
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="file-upload"
          />
          
          <div className="flex flex-col items-center space-y-6">
            {selectedFile ? (
              <>
                <div className="workflow-node active animate-node-pulse">
                  <Video className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    File ready for processing...
                  </p>
                </div>
              </>
            ) : (
              <>
                <label
                  htmlFor="file-upload"
                  className="workflow-node animate-glow-pulse cursor-pointer hover:scale-110 transition-transform duration-300"
                >
                  <Upload className="w-8 h-8" />
                </label>
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">
                    Drop your MP4 file here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click the upload button
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Supported formats: MP4, MOV, AVI • Max size: 100MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;