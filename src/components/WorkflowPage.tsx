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
  const [pathProgress, setPathProgress] = useState<number[]>([0, 0, 0, 0, 0]);

  const nodes: WorkflowNode[] = [
    {
      id: 'upload',
      icon: <Upload className="w-6 h-6" />,
      label: 'Upload',
      status: 'completed',
      position: { x: 5, y: 10 }
    },
    {
      id: 'audio-extraction',
      icon: <Volume2 className="w-6 h-6" />,
      label: 'Audio Extraction',
      status: currentStep >= 1 ? (currentStep === 1 ? 'processing' : 'completed') : 'pending',
      position: { x: 75, y: 25 }
    },
    {
      id: 'transcription',
      icon: <FileText className="w-6 h-6" />,
      label: 'Transcription',
      status: currentStep >= 2 ? (currentStep === 2 ? 'processing' : 'completed') : 'pending',
      position: { x: 25, y: 40 }
    },
    {
      id: 'translation',
      icon: <Languages className="w-6 h-6" />,
      label: 'Translation',
      status: currentStep >= 3 ? (currentStep === 3 ? 'processing' : 'completed') : 'pending',
      position: { x: 75, y: 55 }
    },
    {
      id: 'voice-cloning',
      icon: <Mic className="w-6 h-6" />,
      label: 'Voice Clone Dubbing',
      status: currentStep >= 4 ? (currentStep === 4 ? 'processing' : 'completed') : 'pending',
      position: { x: 25, y: 70 }
    },
    {
      id: 'download',
      icon: <Download className="w-6 h-6" />,
      label: 'Download',
      status: currentStep >= 5 ? 'completed' : 'pending',
      position: { x: 75, y: 85 }
    }
  ];

  useEffect(() => {
    if (!file) {
      navigate('/');
      return;
    }

    // Simulate processing steps with path progress animation
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < 5) {
          return prev + 1;
        } else {
          clearInterval(timer);
          // Simulate download URL generation
          setDownloadUrl('dubbed_audio.mp3');
          return prev;
        }
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [file, navigate]);

  // Animate path progress when step changes
  useEffect(() => {
    if (currentStep > 0 && currentStep <= 5) {
      const pathIndex = currentStep - 1;
      let progress = 0;
      
      const progressTimer = setInterval(() => {
        progress += 0.05;
        if (progress <= 1) {
          setPathProgress(prev => {
            const newProgress = [...prev];
            newProgress[pathIndex] = progress;
            return newProgress;
          });
        } else {
          clearInterval(progressTimer);
        }
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

  const generatePath = (from: WorkflowNode, to: WorkflowNode, pathIndex: number) => {
    const startX = from.position.x;
    const startY = from.position.y;
    const endX = to.position.x;
    const endY = to.position.y;
    
    // Create varied S-shaped curves
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // Different control points for each path to create varied S-curves
    const variations = [
      { c1x: startX + 30, c1y: startY - 5, c2x: endX - 25, c2y: endY + 8 },
      { c1x: startX - 20, c1y: startY + 10, c2x: endX + 30, c2y: endY - 5 },
      { c1x: startX + 25, c1y: startY + 8, c2x: endX - 30, c2y: endY - 10 },
      { c1x: startX - 25, c1y: startY - 8, c2x: endX + 20, c2y: endY + 12 },
      { c1x: startX + 35, c1y: startY + 5, c2x: endX - 15, c2y: endY - 8 }
    ];
    
    const variation = variations[pathIndex % variations.length];
    
    return `M ${startX} ${startY} C ${variation.c1x} ${variation.c1y}, ${variation.c2x} ${variation.c2y}, ${endX} ${endY}`;
  };

  const isPathwayActive = (index: number) => {
    return currentStep > index;
  };

  const getPathStrokeDasharray = (index: number) => {
    const progress = pathProgress[index] || 0;
    const totalLength = 100; // Approximate path length
    const dashedLength = totalLength * progress;
    return `${dashedLength} ${totalLength - dashedLength}`;
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
          {/* Draw pathways */}
          {nodes.slice(0, -1).map((node, index) => {
            const nextNode = nodes[index + 1];
            const isActive = isPathwayActive(index);
            const isCurrentlyAnimating = currentStep === index + 1;
            
            return (
              <path
                key={`path-${node.id}-${nextNode.id}`}
                d={generatePath(node, nextNode, index)}
                className={`pathway ${isCurrentlyAnimating ? 'pathway-glow' : ''}`}
                style={{
                  opacity: isActive || isCurrentlyAnimating ? 1 : 0.3,
                  strokeDasharray: isCurrentlyAnimating ? getPathStrokeDasharray(index) : (isActive ? '3 2' : '2 3'),
                  stroke: isCurrentlyAnimating ? 'hsl(var(--cosmic-glow))' : 'hsl(var(--pathway))',
                  strokeWidth: isCurrentlyAnimating ? 2 : 1.5
                }}
              />
            );
          })}
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