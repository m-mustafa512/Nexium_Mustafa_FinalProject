interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    duration: string;
    achievements: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    location: string;
    year: string;
  }>;
  skills: string[];
}

export function CreativeTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white font-sans text-gray-900">
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-gradient-to-b from-purple-600 to-purple-800 text-white p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">
              {data.personalInfo.name}
            </h1>
            <div className="space-y-2 text-purple-100 text-sm">
              <p>{data.personalInfo.email}</p>
              <p>{data.personalInfo.phone}</p>
              <p>{data.personalInfo.location}</p>
              {data.personalInfo.linkedin && (
                <p className="break-all">{data.personalInfo.linkedin}</p>
              )}
              {data.personalInfo.portfolio && (
                <p className="break-all">{data.personalInfo.portfolio}</p>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-purple-100">
              ◆ Skills
            </h2>
            <div className="space-y-2">
              {data.skills.map((skill, index) => (
                <div key={index} className="text-sm">
                  <span className="bg-purple-500 bg-opacity-50 px-2 py-1 rounded text-white">
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-purple-100">
              ◆ Education
            </h2>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className="text-sm">
                  <h3 className="font-semibold text-white mb-1">
                    {edu.degree}
                  </h3>
                  <p className="text-purple-200 text-xs">
                    {edu.school}
                  </p>
                  <p className="text-purple-200 text-xs">
                    {edu.location} • {edu.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-2/3 p-8">
          {/* Summary */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-purple-800 mb-4 border-l-4 border-purple-600 pl-4">
              ◆ Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {data.summary}
            </p>
          </div>

          {/* Experience */}
          <div>
            <h2 className="text-xl font-bold text-purple-800 mb-4 border-l-4 border-purple-600 pl-4">
              ◆ Professional Experience
            </h2>
            <div className="space-y-6">
              {data.experience.map((exp, index) => (
                <div key={index} className="relative">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {exp.title}
                      </h3>
                      <p className="text-purple-600 font-medium">
                        {exp.company} | {exp.location}
                      </p>
                    </div>
                    <span className="text-gray-600 bg-purple-100 px-3 py-1 rounded-full text-sm">
                      {exp.duration}
                    </span>
                  </div>
                  <ul className="space-y-1 text-gray-700 ml-0">
                    {exp.achievements.map((achievement, achIndex) => (
                      <li key={achIndex} className="flex items-start">
                        <span className="text-purple-600 mr-2 mt-1.5 font-bold">▸</span>
                        <span className="text-sm">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}