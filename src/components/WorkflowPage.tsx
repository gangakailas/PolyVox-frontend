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

const nodes: WorkflowNode[] = [
  { id: 'upload', icon: <Upload className="w-6 h-6 text-yellow-400" />, label: 'Upload', status: 'completed', position: { x: 49, y: 10 } },
  { id: 'audio-extraction', icon: <Volume2 className="w-6 h-6 text-orange-400" />, label: 'Audio Extraction', status: currentStep >= 1 ? (currentStep === 1 ? 'processing' : 'completed') : 'pending', position: { x: 80, y: 25 } },
  { id: 'transcription', icon: <FileText className="w-6 h-6 text-blue-400" />, label: 'Transcription', status: currentStep >= 2 ? (currentStep === 2 ? 'processing' : 'completed') : 'pending', position: { x: 20, y: 40 } },
  { id: 'translation', icon: <Languages className="w-6 h-6 text-purple-400" />, label: 'Translation', status: currentStep >= 3 ? (currentStep === 3 ? 'processing' : 'completed') : 'pending', position: { x: 79, y: 50 } },
  { id: 'voice-cloning', icon: <Mic className="w-6 h-6 text-teal-400" />, label: 'Voice Clone Dubbing', status: currentStep >= 4 ? (currentStep === 4 ? 'processing' : 'completed') : 'pending', position: { x: 22, y: 65 } },
  { id: 'download', icon: <Download className="w-6 h-6 text-green-400" />, label: 'Download', status: currentStep >= 5 ? 'completed' : 'pending', position: { x: 51, y: 80 } }
];

  useEffect(() => {
    if (!file) navigate('/');
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < 5) return prev + 1;
        clearInterval(timer);
        setDownloadUrl('dubbed_audio.mp3');
        return prev;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [file, navigate]);

  useEffect(() => {
    if (currentStep > 0 && currentStep <= 5) {
      const pathIndex = currentStep - 1;
      let litDashes = 0;

      const dashTimer = setInterval(() => {
        litDashes++;
        const progress = litDashes / 30;
        setDashProgress(prev => {
          const newProgress = [...prev];
          newProgress[pathIndex] = Math.min(progress, 1);
          return newProgress;
        });

        if (progress >= 1) {
          clearInterval(dashTimer);
          setTimeout(() => {
            setNodeFlicker(prev => {
              const newFlicker = [...prev];
              newFlicker[pathIndex + 1] = true;
              return newFlicker;
            });
            setTimeout(() => {
              setNodeFlicker(prev => {
                const newFlicker = [...prev];
                newFlicker[pathIndex + 1] = false;
                return newFlicker;
              });
            }, 800);
          }, 200);
        }
      }, 100);

      return () => clearInterval(dashTimer);
    }
  }, [currentStep]);

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = '#';
      link.download = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateSegmentedPath = (from: WorkflowNode, to: WorkflowNode, dashes = 30) => {
    const segments = [];
    const dx = to.position.x - from.position.x;
    const dy = to.position.y - from.position.y;

    for (let i = 0; i < dashes; i++) {
      const pct = i / dashes;
      const nextPct = (i + 1) / dashes;

      let x1, y1, x2, y2;

      if (pct < 0.5) {
        x1 = from.position.x + dx * (pct * 2);
        y1 = from.position.y;
        x2 = from.position.x + dx * (nextPct * 2);
        y2 = from.position.y;
      } else {
        x1 = to.position.x;
        y1 = from.position.y + dy * ((pct - 0.5) * 2);
        x2 = to.position.x;
        y2 = from.position.y + dy * ((nextPct - 0.5) * 2);
      }

      segments.push(`M${x1},${y1} L${x2},${y2}`);
    }

    return segments;
  };

  const getNodeStatusClass = (status: WorkflowNode['status'], id: string) => {
    if (id === 'download' && status === 'completed') return 'workflow-node glow';
    switch (status) {
      case 'completed': return 'workflow-node active';
      case 'processing': return 'workflow-node active';
      case 'error': return 'workflow-node text-destructive border-destructive';
      default: return 'workflow-node inactive';
    }
  };

  if (!file) return null;

  return (
    <div className="cosmic-bg min-h-screen relative overflow-hidden">
      <div className="wormhole-bg animate-wormhole-spin"></div>

      <div className="relative z-10 p-6 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Upload</span>
        </button>
        <div className="w-24"></div>
      </div>

      <div className="relative z-10 h-[calc(100vh-120px)] p-8">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {nodes.slice(0, -1).map((node, index) => {
            const nextNode = nodes[index + 1];
            const progress = dashProgress[index] || 0;
            const totalDashes = 30;
            const visibleDashes = Math.floor(progress * totalDashes);
            const segments = generateSegmentedPath(node, nextNode);

            return segments.map((seg, i) => (
              <path
                key={`dash-${index}-${i}`}
                d={seg}
                stroke={i < visibleDashes ? 'hsl(var(--primary))' : 'darkgreen'}
                fill="none"
                strokeWidth={0.4}
                strokeLinecap="round"
              />
            ));
          })}
        </svg>

        {nodes.map((node, i) => (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
          >
            <div
              className={`${getNodeStatusClass(node.status, node.id)} ${nodeFlicker[i] ? 'flicker-flash' : ''}`}
              style={{
                filter: nodeFlicker[i] ? 'drop-shadow(0 0 6px hsl(var(--cosmic-glow))) brightness(1.3)' : 'none',
                background: 'hsl(var(--card))',
                borderRadius: '50%',
                transition: 'filter 0.1s ease-in-out',
                cursor: node.id === 'download' && node.status === 'completed' ? 'pointer' : 'default',
                boxShadow: node.id === 'download' && node.status === 'completed' ? '0 0 10px hsl(var(--cosmic-glow))' : 'none'
              }}
              onClick={node.id === 'download' && node.status === 'completed' ? handleDownload : undefined}
            >
              {node.icon}
            </div>
            <div className="text-center mt-3">
              <p className="text-sm font-medium text-foreground">{node.label}</p>
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
    </div>
  );
};

export default WorkflowPage;
