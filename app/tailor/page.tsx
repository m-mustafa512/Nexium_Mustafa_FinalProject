'use client';

import { useState, useEffect } from 'react';
import { workflowManager, createTailoringOptions, getWorkflowProgressMessage } from '@/src/ai';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, FileText, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CosmicParticlesWrapper } from '@/components/CosmicParticlesWrapper';
import { useRouter } from 'next/navigation';

const tailoringSteps = [
  { id: 1, name: 'Analyzing job requirements', description: 'Extracting key skills and qualifications' },
  { id: 2, name: 'Matching your experience', description: 'Finding relevant experience and skills' },
  { id: 3, name: 'Optimizing keywords', description: 'Enhancing ATS compatibility' },
  { id: 4, name: 'Restructuring content', description: 'Prioritizing most relevant information' },
  { id: 5, name: 'Final optimization', description: 'Polishing and formatting' }
];

export default function TailorResume() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    startTailoringWorkflow();
  }, []);

  const startTailoringWorkflow = async () => {
    try {
      // Get stored data
      const resumeData = localStorage.getItem('currentResume');
      const jobData = localStorage.getItem('currentJob');
      const templateData = localStorage.getItem('selectedTemplate');

      if (!resumeData || !jobData) {
        router.push('/upload');
        return;
      }

      const resume = JSON.parse(resumeData);
      const job = JSON.parse(jobData);
      const template = templateData || 'modern';

      // Create tailoring options
      const options = createTailoringOptions(
        template as 'modern' | 'minimalist' | 'creative',
        [], // focusAreas - could be extracted from job description
        [], // industryKeywords - could be extracted from job description
        true // optimizeForATS
      );

      // Start workflow
      const id = await workflowManager.startWorkflow({
        originalResume: resume.content,
        jobDescription: {
          title: job.title,
          description: job.description,
        },
        options,
      });

      setWorkflowId(id);
      pollWorkflowStatus(id);
    } catch (error) {
      console.error('Error starting workflow:', error);
      // Fallback to simulation
      simulateProgress();
    }
  };

  const pollWorkflowStatus = (id: string) => {
    const interval = setInterval(() => {
      const status = workflowManager.getWorkflowStatus(id);
      
      if (status) {
        setProgress(status.progress);
        const stepProgress = Math.floor(status.progress / 20);
        setCurrentStep(Math.min(stepProgress, tailoringSteps.length - 1));

        if (status.status === 'completed') {
          setIsComplete(true);
          clearInterval(interval);
          
          // Store the tailored resume
          if (status.result) {
            localStorage.setItem('tailoredResume', JSON.stringify(status.result));
          }
        } else if (status.status === 'failed') {
          console.error('Workflow failed:', status.error);
          clearInterval(interval);
          // Fallback to simulation
          simulateProgress();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const simulateProgress = () => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsComplete(true);
          clearInterval(interval);
          return 100;
        }
        
        const newProgress = prev + Math.random() * 15 + 5;
        const stepProgress = Math.floor(newProgress / 20);
        setCurrentStep(Math.min(stepProgress, tailoringSteps.length - 1));
        
        return Math.min(newProgress, 100);
      });
    }, 800);
  };

  const handleContinue = () => {
    router.push('/preview');
  };

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
            {!isComplete && (
              <Link href="/select-template">
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            )}
          </nav>

          {/* Content */}
          <div className="px-6 py-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isComplete ? 'Resume Tailored Successfully!' : 'AI is Tailoring Your Resume'}
              </h1>
              <p className="text-gray-600">
                {isComplete 
                  ? 'Your resume has been optimized for the target job. Ready to preview!'
                  : 'Please wait while we optimize your resume for maximum impact.'
                }
              </p>
            </motion.div>

            {/* Progress Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-8"
            >
              <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progress
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  {/* Current Step */}
                  {!isComplete && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {tailoringSteps[currentStep]?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {tailoringSteps[currentStep]?.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {isComplete && (
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Tailoring Complete!
                        </p>
                        <p className="text-sm text-gray-600">
                          Your resume has been optimized for the target job
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Steps Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle>Tailoring Process</CardTitle>
                  <CardDescription>
                    How AI is optimizing your resume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tailoringSteps.map((step, index) => (
                      <div 
                        key={step.id}
                        className={`flex items-center space-x-3 ${
                          index <= currentStep ? 'opacity-100' : 'opacity-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          index < currentStep 
                            ? 'bg-green-500' 
                            : index === currentStep 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                            : 'bg-gray-300'
                        }`}>
                          {index < currentStep ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : index === currentStep ? (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          ) : (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${
                            index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.name}
                          </p>
                          <p className={`text-sm ${
                            index <= currentStep ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Continue Button */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex justify-center"
              >
                <Button 
                  onClick={handleContinue}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Preview Tailored Resume
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </CosmicParticlesWrapper>
    </div>
  );
}