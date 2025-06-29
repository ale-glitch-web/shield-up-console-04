
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Copy, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IpScanResult {
  ip: string;
  status: 'clean' | 'suspicious' | 'malicious';
  country: string;
  isp: string;
  threatLevel: number;
  blacklists: string[];
  lastSeen: string;
}

const IpChecker = () => {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IpScanResult | null>(null);
  const { toast } = useToast();

  const mockScanIp = async (targetIp: string): Promise<IpScanResult> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const maliciousIps = ['192.168.1.666', '10.0.0.999', '172.16.0.666'];
    const isMalicious = maliciousIps.includes(targetIp);
    
    const countries = ['United States', 'Russia', 'China', 'Germany', 'Brazil'];
    const isps = ['Cloudflare', 'Amazon AWS', 'Google Cloud', 'Microsoft Azure', 'DigitalOcean'];
    
    return {
      ip: targetIp,
      status: isMalicious ? 'malicious' : Math.random() > 0.7 ? 'suspicious' : 'clean',
      country: countries[Math.floor(Math.random() * countries.length)],
      isp: isps[Math.floor(Math.random() * isps.length)],
      threatLevel: Math.floor(Math.random() * 100),
      blacklists: isMalicious ? ['Spamhaus', 'SURBL'] : Math.random() > 0.8 ? ['Blocklist.de'] : [],
      lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString()
    };
  };

  const handleScan = async () => {
    if (!ip.trim()) return;
    
    // Basic IP validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) {
      toast({
        title: "Invalid IP Address",
        description: "Please enter a valid IPv4 address",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const scanResult = await mockScanIp(ip);
      setResult(scanResult);
      
      // Save to local storage
      const history = JSON.parse(localStorage.getItem('scan_history') || '[]');
      history.unshift({ ...scanResult, type: 'ip', timestamp: Date.now() });
      localStorage.setItem('scan_history', JSON.stringify(history.slice(0, 50)));
      
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to scan IP address. Please try again.",
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
      description: "IP address copied to clipboard"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clean': return 'bg-green-500 hover:bg-green-600';
      case 'suspicious': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'malicious': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getThreatLevelColor = (level: number) => {
    if (level < 30) return 'text-green-400';
    if (level < 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="Enter IP address (e.g., 192.168.1.1)"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
          onKeyPress={(e) => e.key === 'Enter' && handleScan()}
        />
        <Button 
          onClick={handleScan} 
          disabled={loading || !ip.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? 'Checking...' : 'Check'}
        </Button>
      </div>

      {result && (
        <div className="space-y-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {result.status === 'clean' ? (
                <Shield className="h-5 w-5 text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400" />
              )}
              <span className="font-mono font-medium">{result.ip}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(result.ip)}
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
              <span className="text-gray-400">Country:</span>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{result.country}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-400">ISP:</span>
              <div>{result.isp}</div>
            </div>
            <div>
              <span className="text-gray-400">Threat Level:</span>
              <div className={`font-mono text-lg ${getThreatLevelColor(result.threatLevel)}`}>
                {result.threatLevel}/100
              </div>
            </div>
            <div>
              <span className="text-gray-400">Last Seen:</span>
              <div className="font-mono text-sm">{new Date(result.lastSeen).toLocaleString()}</div>
            </div>
          </div>

          {result.blacklists.length > 0 && (
            <div>
              <span className="text-gray-400 text-sm">Found in Blacklists:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.blacklists.map((blacklist, index) => (
                  <Badge key={index} variant="destructive">
                    {blacklist}
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

export default IpChecker;
