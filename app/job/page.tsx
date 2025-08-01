'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Briefcase, ArrowRight, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CosmicParticlesWrapper } from '@/components/CosmicParticlesWrapper';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function JobDescription() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobDescription) {
      toast.error('Please provide both job title and description.');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store job data
      const jobData = {
        title: jobTitle,
        description: jobDescription
      };
      
      localStorage.setItem('currentJob', JSON.stringify(jobData));
      toast.success('Job description processed successfully!');
      router.push('/select-template');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <Link href="/upload">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </nav>

          {/* Content */}
          <div className="px-6 py-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Target Job Description
              </h1>
              <p className="text-gray-600">
                Provide details about the job you're applying for so AI can tailor your resume perfectly.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Job Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Job Title
                    </CardTitle>
                    <CardDescription>
                      What position are you applying for?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="e.g., Senior Software Engineer, Product Manager, UX Designer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="bg-white/50"
                      required
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Job Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                    <CardDescription>
                      Paste the complete job posting or requirements. The more details you provide, 
                      the better AI can tailor your resume.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-80 bg-white/50"
                      required
                    />
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Include requirements, skills, and qualifications</li>
                        <li>• Add company information if available</li>
                        <li>• Include preferred experience and education</li>
                        <li>• Mention any specific tools or technologies</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex justify-center"
              >
                <Button 
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      Analyze & Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </div>
        </div>
      </CosmicParticlesWrapper>
    </div>
  );
}