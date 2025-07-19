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
  const [dashProgress, setDashProgress] = useState<number[]>([0, 0, 0, 0, 0]);
  const [nodeFlicker, setNodeFlicker] = useState<boolean[]>([false, false, false, false, false, false]);

  // Hairpin circuit layout - like an electrical circuit board
  const nodes: WorkflowNode[] = [
    {
      id: 'upload',
      icon: <Upload className="w-6 h-6" />,
      label: 'Upload',
      status: 'completed',
      position: { x: 15, y: 15 }
    },
    {
      id: 'audio-extraction',
      icon: <Volume2 className="w-6 h-6" />,
      label: 'Audio Extraction',
      status: currentStep >= 1 ? (currentStep === 1 ? 'processing' : 'completed') : 'pending',
      position: { x: 85, y: 15 }
    },
    {
      id: 'transcription',
      icon: <FileText className="w-6 h-6" />,
      label: 'Transcription',
      status: currentStep >= 2 ? (currentStep === 2 ? 'processing' : 'completed') : 'pending',
      position: { x: 85, y: 45 }
    },
    {
      id: 'translation',
      icon: <Languages className="w-6 h-6" />,
      label: 'Translation',
      status: currentStep >= 3 ? (currentStep === 3 ? 'processing' : 'completed') : 'pending',
      position: { x: 85, y: 75 }
    },
    {
      id: 'voice-cloning',
      icon: <Mic className="w-6 h-6" />,
      label: 'Voice Clone Dubbing',
      status: currentStep >= 4 ? (currentStep === 4 ? 'processing' : 'completed') : 'pending',
      position: { x: 15, y: 75 }
    },
    {
      id: 'download',
      icon: <Download className="w-6 h-6" />,
      label: 'Download',
      status: currentStep >= 5 ? 'completed' : 'pending',
      position: { x: 15, y: 45 }
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

  // Electric dash animation when step changes
  useEffect(() => {
    if (currentStep > 0 && currentStep <= 5) {
      const pathIndex = currentStep - 1;
      let dashPosition = 0;
      
      // Animate dashes flowing like electricity
      const dashTimer = setInterval(() => {
        dashPosition += 0.02; // Slower for dash-by-dash effect
        if (dashPosition <= 1) {
          setDashProgress(prev => {
            const newProgress = [...prev];
            newProgress[pathIndex] = dashPosition;
            return newProgress;
          });
        } else {
          clearInterval(dashTimer);
          // Trigger node flicker when dash reaches the node
          setNodeFlicker(prev => {
            const newFlicker = [...prev];
            newFlicker[pathIndex + 1] = true;
            return newFlicker;
          });
          
          // Stop flickering after a brief moment
          setTimeout(() => {
            setNodeFlicker(prev => {
              const newFlicker = [...prev];
              newFlicker[pathIndex + 1] = false;
              return newFlicker;
            });
          }, 500);
        }
      }, 30);

      return () => clearInterval(dashTimer);
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

  // Generate hairpin circuit paths - entering from top, exiting from bottom
  const generateCircuitPath = (from: WorkflowNode, to: WorkflowNode, pathIndex: number) => {
    const startX = from.position.x;
    const startY = from.position.y + 3; // Exit from bottom of node
    const endX = to.position.x;
    const endY = to.position.y - 3; // Enter from top of node
    
    // Create hairpin-like circuit paths
    if (pathIndex === 0) {
      // Upload to Audio Extraction - horizontal right
      return `M ${startX} ${startY} L ${startX + 35} ${startY} L ${startX + 35} ${endY} L ${endX} ${endY}`;
    } else if (pathIndex === 1) {
      // Audio Extraction to Transcription - straight down
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    } else if (pathIndex === 2) {
      // Transcription to Translation - straight down  
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    } else if (pathIndex === 3) {
      // Translation to Voice Cloning - horizontal left and down
      return `M ${startX} ${startY} L ${startX} ${startY + 15} L ${endX - 35} ${startY + 15} L ${endX - 35} ${endY} L ${endX} ${endY}`;
    } else {
      // Voice Cloning to Download - up
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }
  };

  const isPathwayActive = (index: number) => {
    return currentStep > index;
  };

  // Electric dash animation effect
  const getElectricDashArray = (index: number) => {
    const progress = dashProgress[index] || 0;
    const dashLength = 2;
    const gapLength = 3;
    const totalLength = 100;
    const activeDashes = Math.floor((totalLength * progress) / (dashLength + gapLength));
    
    // Create dash pattern with glowing effect
    if (progress > 0 && progress < 1) {
      return `${dashLength} ${gapLength}`;
    } else if (progress >= 1) {
      return `${dashLength} ${gapLength}`;
    } else {
      return `${dashLength} ${gapLength}`;
    }
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
           {/* Draw electric circuit pathways */}
          {nodes.slice(0, -1).map((node, index) => {
            const nextNode = nodes[index + 1];
            const isActive = isPathwayActive(index);
            const isCurrentlyAnimating = currentStep === index + 1;
            const progress = dashProgress[index] || 0;
            
            return (
              <path
                key={`path-${node.id}-${nextNode.id}`}
                d={generateCircuitPath(node, nextNode, index)}
                className="electric-pathway"
                style={{
                  opacity: isActive || isCurrentlyAnimating ? 1 : 0.2,
                  strokeDasharray: getElectricDashArray(index),
                  strokeDashoffset: isCurrentlyAnimating ? `${100 * (1 - progress)}` : '0',
                  stroke: isCurrentlyAnimating && progress > 0 ? '#00ffff' : (isActive ? '#4a90e2' : '#333'),
                  strokeWidth: 1,
                  filter: isCurrentlyAnimating && progress > 0 ? 'drop-shadow(0 0 3px #00ffff)' : 'none',
                  transition: 'none'
                }}
              />
            );
          })}
        </svg>

        {/* Render nodes with flickering effect */}
        {nodes.map((node, nodeIndex) => (
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
                nodeFlicker[nodeIndex] ? 'animate-pulse' : ''
              } ${
                node.id === 'download' && node.status === 'completed' 
                  ? 'cursor-pointer hover:scale-125 transition-transform duration-300' 
                  : ''
              }`}
              style={{
                filter: nodeFlicker[nodeIndex] ? 'drop-shadow(0 0 8px #00ffff) brightness(1.3)' : 'none',
                transition: 'filter 0.1s ease-in-out'
              }}
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