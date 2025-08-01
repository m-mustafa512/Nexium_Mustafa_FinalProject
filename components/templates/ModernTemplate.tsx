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

export function ModernTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 font-sans text-gray-900">
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-6 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {data.personalInfo.name}
        </h1>
        <div className="flex flex-wrap gap-4 text-gray-600">
          <span>{data.personalInfo.email}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
          <span>•</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && (
            <>
              <span>•</span>
              <span className="text-blue-600">{data.personalInfo.linkedin}</span>
            </>
          )}
          {data.personalInfo.portfolio && (
            <>
              <span>•</span>
              <span className="text-blue-600">{data.personalInfo.portfolio}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-4 uppercase tracking-wide">
          Professional Summary
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {data.summary}
        </p>
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-4 uppercase tracking-wide">
          Professional Experience
        </h2>
        <div className="space-y-6">
          {data.experience.map((exp, index) => (
            <div key={index}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {exp.title}
                  </h3>
                  <p className="text-blue-600 font-medium">
                    {exp.company} | {exp.location}
                  </p>
                </div>
                <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded">
                  {exp.duration}
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                {exp.achievements.map((achievement, achIndex) => (
                  <li key={achIndex}>{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-4 uppercase tracking-wide">
          Education
        </h2>
        <div className="space-y-4">
          {data.education.map((edu, index) => (
            <div key={index} className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {edu.degree}
                </h3>
                <p className="text-blue-600">
                  {edu.school} | {edu.location}
                </p>
              </div>
              <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded">
                {edu.year}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-2xl font-bold text-blue-600 mb-4 uppercase tracking-wide">
          Technical Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}