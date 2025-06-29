
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UrlScanResult {
  url: string;
  status: 'safe' | 'suspicious' | 'malicious';
  threats: string[];
  reputation: number;
  lastScan: string;
}

const UrlChecker = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlScanResult | null>(null);
  const { toast } = useToast();

  const mockScanUrl = async (targetUrl: string): Promise<UrlScanResult> => {
    // Mock API response - replace with real VirusTotal or Google Safe Browsing API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const suspiciousDomains = ['malware.com', 'phishing.net', 'spam.org'];
    const isSuspicious = suspiciousDomains.some(domain => targetUrl.includes(domain));
    
    return {
      url: targetUrl,
      status: isSuspicious ? 'malicious' : Math.random() > 0.8 ? 'suspicious' : 'safe',
      threats: isSuspicious ? ['Malware', 'Phishing'] : Math.random() > 0.8 ? ['Suspicious Content'] : [],
      reputation: Math.floor(Math.random() * 100),
      lastScan: new Date().toISOString()
    };
  };

  const handleScan = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    try {
      const scanResult = await mockScanUrl(url);
      setResult(scanResult);
      
      // Save to local storage
      const history = JSON.parse(localStorage.getItem('scan_history') || '[]');
      history.unshift({ ...scanResult, type: 'url', timestamp: Date.now() });
      localStorage.setItem('scan_history', JSON.stringify(history.slice(0, 50)));
      
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to scan URL. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-500 hover:bg-green-600';
      case 'suspicious': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'malicious': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="Enter URL to scan (e.g., https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
          onKeyPress={(e) => e.key === 'Enter' && handleScan()}
        />
        <Button 
          onClick={handleScan} 
          disabled={loading || !url.trim()}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          {loading ? 'Scanning...' : 'Scan'}
        </Button>
      </div>

      {result && (
        <div className="space-y-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {result.status === 'safe' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
              <span className="font-medium">{result.url}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(result.url)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Badge className={getStatusColor(result.status)}>
              {result.status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Reputation Score:</span>
              <div className="font-mono text-lg">{result.reputation}/100</div>
            </div>
            <div>
              <span className="text-gray-400">Last Scan:</span>
              <div className="font-mono text-sm">{new Date(result.lastScan).toLocaleString()}</div>
            </div>
          </div>

          {result.threats.length > 0 && (
            <div>
              <span className="text-gray-400 text-sm">Detected Threats:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.threats.map((threat, index) => (
                  <Badge key={index} variant="destructive">
                    {threat}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UrlChecker;
