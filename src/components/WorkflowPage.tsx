import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Volume2, 
  FileText, 
  Languages, 
  Mic, 
  Download,
  ArrowLeft 
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  icon: React.ReactNode;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  position: { x: number; y: number };
}

const WorkflowPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const file = location.state?.file;
  const [currentStep, setCurrentStep] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [dashProgress, setDashProgress] = useState(0);

  const nodes: WorkflowNode[] = [
    {
      id: 'upload',
      icon: <Upload className="w-6 h-6" />,
      label: 'Upload',
      status: 'completed',
      position: { x: 10, y: 15 }
    },
    {
      id: 'audio-extraction',
      icon: <Volume2 className="w-6 h-6" />,
      label: 'Audio Extraction',
      status: currentStep >= 1 ? (currentStep === 1 ? 'processing' : 'completed') : 'pending',
      position: { x: 30, y: 35 }
    },
    {
      id: 'transcription',
      icon: <FileText className="w-6 h-6" />,
      label: 'Transcription',
      status: currentStep >= 2 ? (currentStep === 2 ? 'processing' : 'completed') : 'pending',
      position: { x: 55, y: 20 }
    },
    {
      id: 'translation',
      icon: <Languages className="w-6 h-6" />,
      label: 'Translation',
      status: currentStep >= 3 ? (currentStep === 3 ? 'processing' : 'completed') : 'pending',
      position: { x: 75, y: 50 }
    },
    {
      id: 'voice-cloning',
      icon: <Mic className="w-6 h-6" />,
      label: 'Voice Clone Dubbing',
      status: currentStep >= 4 ? (currentStep === 4 ? 'processing' : 'completed') : 'pending',
      position: { x: 85, y: 25 }
    },
    {
      id: 'download',
      icon: <Download className="w-6 h-6" />,
      label: 'Download',
      status: currentStep >= 5 ? 'completed' : 'pending',
      position: { x: 90, y: 70 }
    }
  ];

  useEffect(() => {
    if (!file) {
      navigate('/');
      return;
    }

    // Simulate processing steps
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < 5) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setDownloadUrl('dubbed_audio.mp3');
          return prev;
        }
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [file, navigate]);

  // Animate dash progress continuously
  useEffect(() => {
    if (currentStep > 0) {
      const progressTimer = setInterval(() => {
        setDashProgress(prev => {
          const maxProgress = currentStep * 20; // 20% per step
          if (prev < maxProgress) {
            return prev + 0.5;
          }
          return prev;
        });
      }, 50);

      return () => clearInterval(progressTimer);
    }
  }, [currentStep]);

  const handleDownload = () => {
    if (downloadUrl) {
      // Simulate download
      const link = document.createElement('a');
      link.href = '#';
      link.download = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateSinglePath = () => {
    // Create a single smooth curved path through all nodes
    const pathPoints = nodes.map(node => `${node.position.x},${node.position.y}`);
    
    // Create a smooth curve using SVG path with cubic bezier curves
    let pathData = `M ${nodes[0].position.x} ${nodes[0].position.y}`;
    
    for (let i = 1; i < nodes.length; i++) {
      const current = nodes[i];
      const previous = nodes[i - 1];
      
      if (i === 1) {
        // First curve
        const cp1x = previous.position.x + (current.position.x - previous.position.x) * 0.3;
        const cp1y = previous.position.y + (current.position.y - previous.position.y) * 0.1;
        const cp2x = current.position.x - (current.position.x - previous.position.x) * 0.3;
        const cp2y = current.position.y - (current.position.y - previous.position.y) * 0.1;
        pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.position.x} ${current.position.y}`;
      } else {
        // Smooth continuation
        const cp1x = previous.position.x + (current.position.x - previous.position.x) * 0.4;
        const cp1y = previous.position.y + (current.position.y - previous.position.y) * 0.2;
        const cp2x = current.position.x - (current.position.x - previous.position.x) * 0.4;
        const cp2y = current.position.y - (current.position.y - previous.position.y) * 0.2;
        pathData += ` S ${cp2x} ${cp2y}, ${current.position.x} ${current.position.y}`;
      }
    }
    
    return pathData;
  };

  const getDashArray = () => {
    const totalLength = 500; // Approximate total path length
    const dashSize = 8;
    const gapSize = 4;
    const progressLength = (dashProgress / 100) * totalLength;
    
    if (progressLength === 0) return '0 1000';
    
    // Create glowing dashes up to progress point
    let dashArray = '';
    let currentLength = 0;
    
    while (currentLength < progressLength) {
      const remainingProgress = progressLength - currentLength;
      const currentDash = Math.min(dashSize, remainingProgress);
      
      if (dashArray) dashArray += ' ';
      dashArray += `${currentDash} ${gapSize}`;
      currentLength += dashSize + gapSize;
    }
    
    // Add remaining non-glowing portion
    const remaining = totalLength - progressLength;
    if (remaining > 0) {
      dashArray += ` 0 ${remaining}`;
    }
    
    return dashArray;
  };

  const getNodeStatusClass = (status: WorkflowNode['status']) => {
    switch (status) {
      case 'completed':
        return 'workflow-node active';
      case 'processing':
        return 'workflow-node active animate-node-pulse';
      case 'error':
        return 'workflow-node text-destructive border-destructive';
      default:
        return 'workflow-node inactive';
    }
  };

  if (!file) return null;

  return (
    <div className="cosmic-bg min-h-screen relative overflow-hidden">
      <div className="wormhole-bg animate-wormhole-spin"></div>
      
      {/* Header */}
      <div className="relative z-10 p-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Upload</span>
        </button>
        
        <div className="w-24"></div>
      </div>

      {/* Workflow Visualization */}
      <div className="relative z-10 h-[calc(100vh-120px)] p-8">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Draw single pathway */}
          <path
            d={generateSinglePath()}
            className="pathway"
            style={{
              stroke: dashProgress > 0 ? 'hsl(var(--cosmic-glow))' : 'hsl(var(--pathway))',
              strokeWidth: dashProgress > 0 ? 2.5 : 1.5,
              strokeDasharray: getDashArray(),
              filter: dashProgress > 0 ? 'drop-shadow(0 0 15px hsl(var(--cosmic-glow) / 0.8))' : 'drop-shadow(0 0 8px hsl(var(--cosmic-glow) / 0.4))',
              opacity: 1
            }}
          />
          
          {/* Static base path */}
          <path
            d={generateSinglePath()}
            className="pathway"
            style={{
              stroke: 'hsl(var(--pathway) / 0.3)',
              strokeWidth: 1,
              strokeDasharray: '3 3',
              opacity: 0.5
            }}
          />
        </svg>

        {/* Render nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${node.position.x}%`,
              top: `${node.position.y}%`
            }}
          >
            <div 
              className={`${getNodeStatusClass(node.status)} ${
                node.id === 'download' && node.status === 'completed' 
                  ? 'cursor-pointer hover:scale-125 transition-transform duration-300' 
                  : ''
              }`}
              onClick={node.id === 'download' && node.status === 'completed' ? handleDownload : undefined}
            >
              {node.icon}
            </div>
            <div className="text-center mt-3">
              <p className="text-sm font-medium text-foreground">
                {node.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {node.status === 'processing' && 'Processing...'}
                {node.status === 'completed' && (node.id === 'download' ? 'Click to download' : 'Completed')}
                {node.status === 'pending' && 'Waiting...'}
                {node.status === 'error' && 'Error'}
              </p>
            </div>
          </div>
        ))}

      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-96 bg-card/30 backdrop-blur-sm rounded-full p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium text-foreground">
            {Math.round((currentStep / 5) * 100)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;