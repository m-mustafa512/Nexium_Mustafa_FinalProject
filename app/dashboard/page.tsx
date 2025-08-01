'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, FileText, Calendar, Download, Edit, Trash2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CosmicParticlesWrapper } from '@/components/CosmicParticlesWrapper';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Resume {
  id: string;
  title: string;
  template: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    loadResumes();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);
  };

  const loadResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading resumes:', error);
      } else {
        setResumes(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const deleteResume = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Error deleting resume');
      } else {
        toast.success('Resume deleted successfully');
        loadResumes();
      }
    } catch (error) {
      toast.error('Error deleting resume');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Resume Tailor</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email}
              </span>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </nav>

          {/* Dashboard Content */}
          <div className="px-6 py-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Resumes
              </h1>
              <p className="text-gray-600">
                Manage your tailored resumes and create new ones for different job applications.
              </p>
            </motion.div>

            {/* Create New Resume */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-8"
            >
              <Link href="/upload">
                <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 cursor-pointer border-0">
                  <CardContent className="flex items-center justify-center p-8">
                    <Plus className="w-8 h-8 mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold">Create New Resume</h3>
                      <p className="opacity-90">Upload your resume and start tailoring</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* Resume Grid */}
            {resumes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume, index) => (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                  >
                    <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-900 truncate">
                            {resume.title}
                          </span>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/preview/${resume.id}`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteResume(resume.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <FileText className="w-4 h-4 mr-2" />
                            {resume.template} Template
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            Updated {formatDate(resume.updated_at)}
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/preview/${resume.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No resumes yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first tailored resume to get started.
                </p>
                <Link href="/upload">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Resume
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </CosmicParticlesWrapper>
    </div>
  );
}