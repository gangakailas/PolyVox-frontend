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
  const [pathProgress, setPathProgress] = useState(0);

  // Generate positions along a single curved path
  const generateNodePositions = (): { x: number; y: number }[] => {
    const positions = [];
    const numNodes = 6;
    
    for (let i = 0; i < numNodes; i++) {
      const t = i / (numNodes - 1); // 0 to 1
      
      // S-curve path from top-left to bottom-right
      const x = 15 + t * 70; // Start at 15%, end at 85%
      const y = 15 + t * 70 + Math.sin(t * Math.PI * 2) * 15; // S-curve with oscillation
      
      positions.push({ x, y });
    }
    
    return positions;
  };

  const nodePositions = generateNodePositions();

  const nodes: WorkflowNode[] = [
    {
      id: 'upload',
      icon: <Upload className="w-6 h-6" />,
      label: 'Upload',
      status: 'completed',
      position: nodePositions[0]
    },
    {
      id: 'audio-extraction',
      icon: <Volume2 className="w-6 h-6" />,
      label: 'Audio Extraction',
      status: currentStep >= 1 ? (currentStep === 1 ? 'processing' : 'completed') : 'pending',
      position: nodePositions[1]
    },
    {
      id: 'transcription',
      icon: <FileText className="w-6 h-6" />,
      label: 'Transcription',
      status: currentStep >= 2 ? (currentStep === 2 ? 'processing' : 'completed') : 'pending',
      position: nodePositions[2]
    },
    {
      id: 'translation',
      icon: <Languages className="w-6 h-6" />,
      label: 'Translation',
      status: currentStep >= 3 ? (currentStep === 3 ? 'processing' : 'completed') : 'pending',
      position: nodePositions[3]
    },
    {
      id: 'voice-cloning',
      icon: <Mic className="w-6 h-6" />,
      label: 'Voice Clone Dubbing',
      status: currentStep >= 4 ? (currentStep === 4 ? 'processing' : 'completed') : 'pending',
      position: nodePositions[4]
    },
    {
      id: 'download',
      icon: <Download className="w-6 h-6" />,
      label: 'Download',
      status: currentStep >= 5 ? 'completed' : 'pending',
      position: nodePositions[5]
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
    if (currentStep > 0) {
      let progress = 0;
      
      const progressTimer = setInterval(() => {
        progress += 0.02;
        if (progress <= 1) {
          setPathProgress(progress);
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

  // Generate single curved path through all nodes
  const generateSinglePath = () => {
    const pathCommands = [];
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      if (i === 0) {
        // Move to first node
        pathCommands.push(`M ${node.position.x} ${node.position.y}`);
      } else {
        const prevNode = nodes[i - 1];
        
        // Create smooth curve to next node
        const controlOffset = 10;
        const c1x = prevNode.position.x + controlOffset;
        const c1y = prevNode.position.y;
        const c2x = node.position.x - controlOffset;
        const c2y = node.position.y;
        
        pathCommands.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${node.position.x} ${node.position.y}`);
      }
    }
    
    return pathCommands.join(' ');
  };

  const getPathStrokeDasharray = () => {
    const currentProgress = Math.min(pathProgress, currentStep / 5);
    const totalLength = 500; // Approximate total path length
    const activeLength = totalLength * currentProgress;
    const dashLength = 10;
    const gapLength = 5;
    
    // Create dash pattern that appears to move
    const numDashes = Math.floor(activeLength / (dashLength + gapLength));
    const remainingLength = activeLength % (dashLength + gapLength);
    
    let dashArray = '';
    for (let i = 0; i < numDashes; i++) {
      dashArray += `${dashLength} ${gapLength} `;
    }
    
    if (remainingLength > 0) {
      dashArray += `${Math.min(remainingLength, dashLength)} ${totalLength}`;
    } else {
      dashArray += `0 ${totalLength}`;
    }
    
    return dashArray.trim();
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
          {/* Single curved path through all nodes */}
          <path
            d={generateSinglePath()}
            className="pathway pathway-glow"
            style={{
              opacity: currentStep > 0 ? 1 : 0.3,
              strokeDasharray: getPathStrokeDasharray(),
              stroke: 'hsl(var(--cosmic-glow))',
              strokeWidth: 2,
              fill: 'none'
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