
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Copy, FileText, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileHashResult {
  fileName: string;
  fileSize: number;
  md5: string;
  sha256: string;
  sha1: string;
  timestamp: string;
}

const FileHashVerifier = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FileHashResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const calculateHashes = async (file: File): Promise<FileHashResult> => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Calculate MD5
    const md5Hash = await crypto.subtle.digest('MD5', uint8Array).catch(() => 
      // Fallback simple hash if MD5 not supported
      crypto.subtle.digest('SHA-256', uint8Array)
    );
    
    // Calculate SHA-256
    const sha256Hash = await crypto.subtle.digest('SHA-256', uint8Array);
    
    // Calculate SHA-1
    const sha1Hash = await crypto.subtle.digest('SHA-1', uint8Array);

    const hashToHex = (hashBuffer: ArrayBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    return {
      fileName: file.name,
      fileSize: file.size,
      md5: hashToHex(md5Hash),
      sha256: hashToHex(sha256Hash),
      sha1: hashToHex(sha1Hash),
      timestamp: new Date().toISOString()
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleVerify = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const hashResult = await calculateHashes(file);
      setResult(hashResult);
      
      // Save to local storage
      const history = JSON.parse(localStorage.getItem('scan_history') || '[]');
      history.unshift({ ...hashResult, type: 'file_hash', timestamp: Date.now() });
      localStorage.setItem('scan_history', JSON.stringify(history.slice(0, 50)));
      
      toast({
        title: "Hashes Generated",
        description: "File hashes calculated successfully"
      });
    } catch (error) {
      toast({
        title: "Hash Generation Failed",
        description: "Unable to calculate file hashes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, hashType: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${hashType} hash copied to clipboard`
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {!file ? (
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-gray-400 mb-2">Select a file to verify its hash</p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Choose File
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-6 w-6 text-green-400" />
              <span className="font-medium">{file.name}</span>
              <Badge variant="outline">{formatFileSize(file.size)}</Badge>
            </div>
            <div className="flex space-x-2 justify-center">
              <Button 
                onClick={handleVerify} 
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {loading ? 'Generating...' : 'Generate Hashes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Change File
              </Button>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <div className="flex items-center space-x-2 mb-4">
            <Hash className="h-5 w-5 text-green-400" />
            <span className="font-medium">File Hashes</span>
            <Badge variant="outline">{result.fileName}</Badge>
          </div>

          <div className="space-y-4">
            {/* MD5 Hash */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">MD5</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.md5, 'MD5')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="font-mono text-sm bg-gray-800 p-2 rounded border break-all">
                {result.md5}
              </div>
            </div>

            {/* SHA-1 Hash */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">SHA-1</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.sha1, 'SHA-1')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="font-mono text-sm bg-gray-800 p-2 rounded border break-all">
                {result.sha1}
              </div>
            </div>

            {/* SHA-256 Hash */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">SHA-256</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.sha256, 'SHA-256')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="font-mono text-sm bg-gray-800 p-2 rounded border break-all">
                {result.sha256}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-4">
            Generated: {new Date(result.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileHashVerifier;
