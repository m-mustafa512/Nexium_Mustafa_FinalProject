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

export function MinimalistTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 font-sans text-gray-900">
      {/* Header */}
      <div className="text-center border-b border-gray-300 pb-6 mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-3">
          {data.personalInfo.name}
        </h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <span>{data.personalInfo.email}</span>
          <span>|</span>
          <span>{data.personalInfo.phone}</span>
          <span>|</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && (
            <>
              <span>|</span>
              <span>{data.personalInfo.linkedin}</span>
            </>
          )}
          {data.personalInfo.portfolio && (
            <>
              <span>|</span>
              <span>{data.personalInfo.portfolio}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-3 border-b border-gray-200 pb-1">
          Summary
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          {data.summary}
        </p>
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-3 border-b border-gray-200 pb-1">
          Experience
        </h2>
        <div className="space-y-6">
          {data.experience.map((exp, index) => (
            <div key={index}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {exp.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {exp.company} • {exp.location}
                  </p>
                </div>
                <span className="text-gray-500 text-sm">
                  {exp.duration}
                </span>
              </div>
              <ul className="space-y-1 text-gray-700 text-sm ml-0">
                {exp.achievements.map((achievement, achIndex) => (
                  <li key={achIndex} className="flex items-start">
                    <span className="text-gray-400 mr-2 mt-1.5">•</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-3 border-b border-gray-200 pb-1">
          Education
        </h2>
        <div className="space-y-3">
          {data.education.map((edu, index) => (
            <div key={index} className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900 text-sm">
                  {edu.degree}
                </h3>
                <p className="text-gray-600 text-sm">
                  {edu.school} • {edu.location}
                </p>
              </div>
              <span className="text-gray-500 text-sm">
                {edu.year}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-3 border-b border-gray-200 pb-1">
          Skills
        </h2>
        <div className="text-sm text-gray-700">
          {data.skills.join(' • ')}
        </div>
      </div>
    </div>
  );
}