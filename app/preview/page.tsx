'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, ArrowLeft, FileText, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CosmicParticlesWrapper } from '@/components/CosmicParticlesWrapper';
import { ModernTemplate } from '@/components/templates/ModernTemplate';
import { MinimalistTemplate } from '@/components/templates/MinimalistTemplate';
import { CreativeTemplate } from '@/components/templates/CreativeTemplate';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function PreviewResume() {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isDownloading, setIsDownloading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load resume data from localStorage
    const storedResume = localStorage.getItem('currentResume');
    const tailoredResume = localStorage.getItem('tailoredResume');
    const selectedTemplateStorage = localStorage.getItem('selectedTemplate');
    
    if (selectedTemplateStorage) {
      setSelectedTemplate(selectedTemplateStorage);
    }
    
    // Use tailored resume if available, otherwise use original
    const resumeToUse = tailoredResume || storedResume;
    
    if (resumeToUse) {
      try {
        const parsedResume = JSON.parse(resumeToUse);
        
        // If it's a tailored resume, use the tailoredResume property
        if (parsedResume.tailoredResume) {
          setResumeData(parsedResume.tailoredResume);
        } else if (parsedResume.content) {
          // If it's the original resume with content property
          setResumeData(parsedResume.content);
        } else {
          // If it's already in the correct format
          setResumeData(parsedResume);
        }
      } catch (error) {
        console.error('Error parsing resume data:', error);
        toast.error('Error loading resume data');
        router.push('/upload');
      }
    } else {
      toast.error('No resume data found');
      router.push('/upload');
    }
    
    setLoading(false);
  }, [router]);

  const templates = {
    modern: ModernTemplate,
    minimalist: MinimalistTemplate,  
    creative: CreativeTemplate
  };

  const TemplateComponent = templates[selectedTemplate as keyof typeof templates];

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Resume downloaded as PDF!');
    } catch (error) {
      toast.error('Error downloading PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadWord = async () => {
    setIsDownloading(true);
    try {
      // Simulate Word generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Resume downloaded as Word document!');
    } catch (error) {
      toast.error('Error downloading Word document');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = () => {
    toast.success('Resume saved to dashboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your resume...</p>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No resume data available</p>
          <Link href="/upload">
            <Button className="mt-4">Upload Resume</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <CosmicParticlesWrapper>
        <div className="relative z-10">
          {/* Navigation */}
          <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Resume Tailor</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/tailor">
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </nav>

          <div className="px-6 py-8 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Controls Panel */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-1 space-y-6"
              >
                {/* Template Selection */}
                <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Template</h3>
                    <div className="space-y-2">
                      {Object.keys(templates).map((template) => (
                        <Button
                          key={template}
                          variant={selectedTemplate === template ? "default" : "outline"}
                          className={`w-full justify-start ${
                            selectedTemplate === template 
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                              : ""
                          }`}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {template.charAt(0).toUpperCase() + template.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                    <div className="space-y-3">
                      <Button 
                        onClick={handleSave}
                        className="w-full justify-start bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Resume
                      </Button>
                      
                      <Button 
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                      </Button>
                      
                      <Button 
                        onClick={handleDownloadWord}
                        disabled={isDownloading}
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {isDownloading ? 'Generating Word...' : 'Download Word'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Resume Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="lg:col-span-3"
              >
                <Card className="bg-white shadow-2xl">
                  <CardContent className="p-0">
                    <div className="w-full h-[1000px] overflow-auto">
                      <TemplateComponent data={resumeData} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </CosmicParticlesWrapper>
    </div>
  );
}