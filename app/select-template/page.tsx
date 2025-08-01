'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, FileText, Check } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CosmicParticlesWrapper } from '@/components/CosmicParticlesWrapper';
import { useRouter } from 'next/navigation';

const templates = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and professional with blue accents and bold section headers',
    preview: '/api/placeholder/300/400',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Simple and elegant with clean whitespace and subtle dividers',
    preview: '/api/placeholder/300/400',
    color: 'from-gray-500 to-gray-600'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Distinctive design with purple accents and creative section layouts',
    preview: '/api/placeholder/300/400',
    color: 'from-purple-500 to-purple-600'
  }
];

export default function SelectTemplate() {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const router = useRouter();

  const handleContinue = () => {
    localStorage.setItem('selectedTemplate', selectedTemplate);
    router.push('/tailor');
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
            <Link href="/job">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </nav>

          {/* Content */}
          <div className="px-6 py-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Choose Your Template
              </h1>
              <p className="text-gray-600">
                Select a professional template that matches your style and industry.
              </p>
            </motion.div>

            {/* Template Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 + index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedTemplate === template.id
                        ? 'ring-2 ring-blue-500 shadow-xl bg-white/90'
                        : 'hover:shadow-lg bg-white/70 backdrop-blur-sm border-white/20'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-0">
                      {/* Template Preview */}
                      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-10`}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className={`w-16 h-16 bg-gradient-to-r ${template.color} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                              <FileText className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-sm text-gray-600">{template.name} Preview</div>
                          </div>
                        </div>
                        {selectedTemplate === template.id && (
                          <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Template Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {template.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {template.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center"
            >
              <Button 
                onClick={handleContinue}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Continue with {templates.find(t => t.id === selectedTemplate)?.name} Template
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </CosmicParticlesWrapper>
    </div>
  );
}