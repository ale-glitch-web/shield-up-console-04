
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PasswordAnalysis {
  password: string;
  score: number;
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  feedback: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    noCommon: boolean;
  };
  estimatedCrackTime: string;
}

const PasswordTester = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);

  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'iloveyou'
  ];

  const analyzePassword = (pwd: string): PasswordAnalysis => {
    let score = 0;
    const feedback: string[] = [];
    
    // Length check
    const hasLength = pwd.length >= 8;
    if (hasLength) score += 20;
    else feedback.push('Use at least 8 characters');

    // Character variety checks
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    
    if (hasUppercase) score += 15;
    else feedback.push('Include uppercase letters');
    
    if (hasLowercase) score += 15;
    else feedback.push('Include lowercase letters');
    
    if (hasNumbers) score += 15;
    else feedback.push('Include numbers');
    
    if (hasSymbols) score += 15;
    else feedback.push('Include special characters');

    // Common password check
    const noCommon = !commonPasswords.includes(pwd.toLowerCase());
    if (noCommon) score += 10;
    else feedback.push('Avoid common passwords');

    // Bonus points for length
    if (pwd.length >= 12) score += 10;
    if (pwd.length >= 16) score += 10;

    // Pattern detection
    if (!/(.)\1{2,}/.test(pwd)) score += 5; // No repeated characters
    else feedback.push('Avoid repeated characters');

    // Determine strength
    let strength: PasswordAnalysis['strength'];
    if (score < 30) strength = 'Very Weak';
    else if (score < 50) strength = 'Weak';
    else if (score < 70) strength = 'Fair';
    else if (score < 90) strength = 'Strong';
    else strength = 'Very Strong';

    // Estimate crack time
    let crackTime = 'Instantly';
    if (score >= 30) crackTime = 'Minutes';
    if (score >= 50) crackTime = 'Hours';
    if (score >= 70) crackTime = 'Days';
    if (score >= 90) crackTime = 'Years';

    return {
      password: pwd,
      score: Math.min(score, 100),
      strength,
      feedback,
      requirements: {
        length: hasLength,
        uppercase: hasUppercase,
        lowercase: hasLowercase,
        numbers: hasNumbers,
        symbols: hasSymbols,
        noCommon
      },
      estimatedCrackTime: crackTime
    };
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.trim()) {
      const result = analyzePassword(value);
      setAnalysis(result);
      
      // Save to local storage
      const history = JSON.parse(localStorage.getItem('scan_history') || '[]');
      const sanitizedResult = { ...result, password: '***HIDDEN***' }; // Don't store actual password
      history.unshift({ ...sanitizedResult, type: 'password', timestamp: Date.now() });
      localStorage.setItem('scan_history', JSON.stringify(history.slice(0, 50)));
    } else {
      setAnalysis(null);
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Weak': return 'text-red-500';
      case 'Weak': return 'text-orange-500';
      case 'Fair': return 'text-yellow-500';
      case 'Strong': return 'text-blue-500';
      case 'Very Strong': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getProgressColor = (score: number) => {
    if (score < 30) return 'bg-red-500';
    if (score < 50) return 'bg-orange-500';
    if (score < 70) return 'bg-yellow-500';
    if (score < 90) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter password to test"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 pr-10"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>

      {analysis && (
        <div className="space-y-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
          {/* Strength Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-400">Password Strength</span>
              <Badge className={`${getStrengthColor(analysis.strength)} bg-transparent border`}>
                {analysis.strength}
              </Badge>
            </div>
            <div className="space-y-1">
              <Progress 
                value={analysis.score} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Score: {analysis.score}/100</span>
                <span>Est. crack time: {analysis.estimatedCrackTime}</span>
              </div>
            </div>
          </div>

          {/* Requirements Checklist */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-400">Requirements</span>
            <div className="grid grid-cols-1 gap-2">
              {[
                { key: 'length', label: 'At least 8 characters' },
                { key: 'uppercase', label: 'Uppercase letters (A-Z)' },
                { key: 'lowercase', label: 'Lowercase letters (a-z)' },
                { key: 'numbers', label: 'Numbers (0-9)' },
                { key: 'symbols', label: 'Special characters (!@#$...)' },
                { key: 'noCommon', label: 'Not a common password' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2 text-sm">
                  {analysis.requirements[key as keyof typeof analysis.requirements] ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className={analysis.requirements[key as keyof typeof analysis.requirements] ? 'text-green-400' : 'text-gray-400'}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {analysis.feedback.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-400">Suggestions</span>
              <div className="space-y-1">
                {analysis.feedback.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordTester;
