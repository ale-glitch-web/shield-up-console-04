
import { useState } from 'react';
import { Shield, Globe, Server, FileCheck, Lock, History, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UrlChecker from '@/components/security/UrlChecker';
import IpChecker from '@/components/security/IpChecker';
import FileHashVerifier from '@/components/security/FileHashVerifier';
import PasswordTester from '@/components/security/PasswordTester';
import ScanHistory from '@/components/security/ScanHistory';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-cyan-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              CyberSec Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-gray-700">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              Security Tools
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              <History className="h-4 w-4 mr-2" />
              Scan History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* URL Checker */}
              <Card className="bg-gray-800 border-gray-700 p-6 hover:border-cyan-500 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <Globe className="h-6 w-6 text-cyan-400" />
                  <h2 className="text-xl font-semibold text-gray-100">URL Security Checker</h2>
                </div>
                <UrlChecker />
              </Card>

              {/* IP Reputation Checker */}
              <Card className="bg-gray-800 border-gray-700 p-6 hover:border-blue-500 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <Server className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-100">IP Reputation Checker</h2>
                </div>
                <IpChecker />
              </Card>

              {/* File Hash Verifier */}
              <Card className="bg-gray-800 border-gray-700 p-6 hover:border-green-500 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <FileCheck className="h-6 w-6 text-green-400" />
                  <h2 className="text-xl font-semibold text-gray-100">File Hash Verifier</h2>
                </div>
                <FileHashVerifier />
              </Card>

              {/* Password Strength Tester */}
              <Card className="bg-gray-800 border-gray-700 p-6 hover:border-purple-500 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <Lock className="h-6 w-6 text-purple-400" />
                  <h2 className="text-xl font-semibold text-gray-100">Password Strength Tester</h2>
                </div>
                <PasswordTester />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <ScanHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
