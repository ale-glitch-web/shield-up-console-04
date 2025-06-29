
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Globe, Server, FileCheck, Lock, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HistoryItem {
  type: 'url' | 'ip' | 'file_hash' | 'password';
  timestamp: number;
  [key: string]: any;
}

const ScanHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('scan_history') || '[]');
    setHistory(savedHistory);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('scan_history');
    setHistory([]);
    toast({
      title: "History Cleared",
      description: "All scan history has been deleted"
    });
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cybersec-scan-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Scan history exported successfully"
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'url': return <Globe className="h-4 w-4 text-cyan-400" />;
      case 'ip': return <Server className="h-4 w-4 text-blue-400" />;
      case 'file_hash': return <FileCheck className="h-4 w-4 text-green-400" />;
      case 'password': return <Lock className="h-4 w-4 text-purple-400" />;
      default: return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'url': return 'URL Scan';
      case 'ip': return 'IP Check';
      case 'file_hash': return 'File Hash';
      case 'password': return 'Password Test';
      default: return 'Unknown';
    }
  };

  const getStatusBadge = (item: HistoryItem) => {
    if (item.status) {
      const statusColors = {
        safe: 'bg-green-500',
        clean: 'bg-green-500',
        suspicious: 'bg-yellow-500',
        malicious: 'bg-red-500'
      };
      return (
        <Badge className={`${statusColors[item.status as keyof typeof statusColors] || 'bg-gray-500'} text-white`}>
          {item.status}
        </Badge>
      );
    }
    if (item.strength) {
      const strengthColors = {
        'Very Strong': 'bg-green-500',
        'Strong': 'bg-blue-500',
        'Fair': 'bg-yellow-500',
        'Weak': 'bg-orange-500',
        'Very Weak': 'bg-red-500'
      };
      return (
        <Badge className={`${strengthColors[item.strength as keyof typeof strengthColors] || 'bg-gray-500'} text-white`}>
          {item.strength}
        </Badge>
      );
    }
    return null;
  };

  const renderItemDetails = (item: HistoryItem) => {
    switch (item.type) {
      case 'url':
        return (
          <div className="text-sm text-gray-400">
            <div>URL: {item.url}</div>
            {item.threats?.length > 0 && (
              <div>Threats: {item.threats.join(', ')}</div>
            )}
          </div>
        );
      case 'ip':
        return (
          <div className="text-sm text-gray-400">
            <div>IP: {item.ip}</div>
            <div>Country: {item.country} | ISP: {item.isp}</div>
            {item.blacklists?.length > 0 && (
              <div>Blacklists: {item.blacklists.join(', ')}</div>
            )}
          </div>
        );
      case 'file_hash':
        return (
          <div className="text-sm text-gray-400">
            <div>File: {item.fileName}</div>
            <div>SHA-256: {item.sha256?.substring(0, 16)}...</div>
          </div>
        );
      case 'password':
        return (
          <div className="text-sm text-gray-400">
            <div>Score: {item.score}/100</div>
            {item.feedback?.length > 0 && (
              <div>Issues: {item.feedback.length} found</div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (history.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-8 text-center">
        <div className="text-gray-400">
          <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Scan History</h3>
          <p>Your security scans will appear here once you start using the tools.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Scan History</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportHistory}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="border-red-600 text-red-400 hover:bg-red-900"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((item, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700 p-4 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-100">{getTypeLabel(item.type)}</span>
                    {getStatusBadge(item)}
                  </div>
                  {renderItemDetails(item)}
                </div>
              </div>
              <div className="text-xs text-gray-500 flex-shrink-0">
                {new Date(item.timestamp).toLocaleDateString()}<br />
                {new Date(item.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScanHistory;
