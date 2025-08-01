'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CosmicParticlesWrapper } from '@/components/CosmicParticlesWrapper';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function UploadResume() {
  const [resumeTitle, setResumeTitle] = useState('');
  const [resumeContent, setResumeContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      if (!resumeTitle) {
        setResumeTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      
      // In a real app, you'd parse the file content here
      // For now, we'll just set a placeholder
      setResumeContent('Resume content from uploaded file will be parsed here...');
      toast.success('File uploaded successfully!');
    }
  }, [resumeTitle]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeTitle || !resumeContent) {
      toast.error('Please provide both title and content for your resume.');
      return;
    }
    
    // Parse resume content to extract structured data
    const parsedContent = parseResumeContent(resumeContent);
    
    // Store resume data in localStorage
    const resumeData = {
      title: resumeTitle,
      content: parsedContent,
      template: 'modern',
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('currentResume', JSON.stringify(resumeData));
    router.push('/job');
  };

  // Simple parser to extract structured data from resume text
  const parseResumeContent = (content: string) => {
    // This is a basic parser - in production, you'd use more sophisticated parsing
    const lines = content.split('\n').filter(line => line.trim());
    
    // Extract basic info (first few lines typically contain contact info)
    const personalInfo = {
      name: lines[0] || 'Your Name',
      email: extractEmail(content) || 'your.email@example.com',
      phone: extractPhone(content) || '(555) 123-4567',
      location: extractLocation(content) || 'Your Location',
      linkedin: extractLinkedIn(content),
      portfolio: extractPortfolio(content)
    };

    // Extract summary (look for summary/objective section)
    const summaryMatch = content.match(/(?:summary|objective|profile)[\s\S]*?(?=\n\n|\nexperience|\neducation|\nskills|$)/i);
    const summary = summaryMatch ? summaryMatch[0].replace(/^(?:summary|objective|profile)\s*/i, '').trim() : 'Professional summary will be extracted from your resume content.';

    // Extract experience (basic extraction)
    const experience = extractExperience(content);
    
    // Extract education
    const education = extractEducation(content);
    
    // Extract skills
    const skills = extractSkills(content);

    return {
      personalInfo,
      summary,
      experience,
      education,
      skills
    };
  };

  const extractEmail = (text: string) => {
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    return emailMatch ? emailMatch[0] : null;
  };

  const extractPhone = (text: string) => {
    const phoneMatch = text.match(/(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
    return phoneMatch ? phoneMatch[0] : null;
  };

  const extractLocation = (text: string) => {
    // Look for city, state patterns
    const locationMatch = text.match(/([A-Za-z\s]+),\s*([A-Z]{2})/);
    return locationMatch ? locationMatch[0] : null;
  };

  const extractLinkedIn = (text: string) => {
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    return linkedinMatch ? linkedinMatch[0] : null;
  };

  const extractPortfolio = (text: string) => {
    const portfolioMatch = text.match(/(?:portfolio|website|github)[\s:]*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    return portfolioMatch ? portfolioMatch[1] : null;
  };

  const extractExperience = (content: string) => {
    // Basic experience extraction - look for job titles and companies
    const experienceSection = content.match(/experience[\s\S]*?(?=\neducation|\nskills|\n\n[A-Z]|$)/i);
    if (!experienceSection) return [];

    // This is a simplified extraction - in production, use more sophisticated parsing
    return [
      {
        title: 'Position Title',
        company: 'Company Name',
        location: 'Location',
        duration: 'Duration',
        achievements: ['Achievement extracted from your resume content']
      }
    ];
  };

  const extractEducation = (content: string) => {
    // Basic education extraction
    const educationSection = content.match(/education[\s\S]*?(?=\nexperience|\nskills|\n\n[A-Z]|$)/i);
    if (!educationSection) return [];

    return [
      {
        degree: 'Degree',
        school: 'School Name',
        location: 'Location',
        year: 'Year'
      }
    ];
  };

  const extractSkills = (content: string) => {
    // Basic skills extraction
    const skillsSection = content.match(/skills[\s\S]*?(?=\nexperience|\neducation|\n\n[A-Z]|$)/i);
    if (!skillsSection) return ['Skill 1', 'Skill 2', 'Skill 3'];

    // Extract comma-separated or line-separated skills
    const skillsText = skillsSection[0].replace(/^skills\s*/i, '');
    const skills = skillsText.split(/[,\n]/).map(skill => skill.trim()).filter(skill => skill.length > 0);
    
    return skills.length > 0 ? skills : ['Skill 1', 'Skill 2', 'Skill 3'];
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
            <Link href="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </nav>

          {/* Upload Content */}
          <div className="px-6 py-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Upload Your Resume
              </h1>
              <p className="text-gray-600">
                Upload your existing resume or paste the content to get started with AI tailoring.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Resume Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle>Resume Title</CardTitle>
                    <CardDescription>
                      Give your resume a descriptive name
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="e.g., Software Engineer Resume - 2024"
                      value={resumeTitle}
                      onChange={(e) => setResumeTitle(e.target.value)}
                      className="bg-white/50"
                      required
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* File Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle>Upload Resume File</CardTitle>
                    <CardDescription>
                      Upload a PDF, Word document, or text file
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      {uploadedFile ? (
                        <div>
                          <p className="text-green-600 font-medium">
                            ✓ {uploadedFile.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            File uploaded successfully
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-600 mb-2">
                            {isDragActive
                              ? 'Drop your resume here...'
                              : 'Drag & drop your resume here, or click to browse'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Supports PDF, DOC, DOCX, and TXT files
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Manual Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle>Or Paste Resume Content</CardTitle>
                    <CardDescription>
                      Copy and paste your resume text directly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Paste your resume content here..."
                      value={resumeContent}
                      onChange={(e) => setResumeContent(e.target.value)}
                      className="min-h-64 bg-white/50"
                      required={!uploadedFile}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex justify-center"
              >
                <Button 
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Continue to Job Description
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </form>
          </div>
        </div>
      </CosmicParticlesWrapper>
    </div>
  );
}