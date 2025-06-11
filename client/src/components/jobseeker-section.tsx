export default function JobSeekerSection() {
  return (
    <section className="bg-norsec-light text-black flex flex-row max-w-screen-xl mx-auto jobseeker-flex" style={{ paddingBottom: '10vh' }}>
      <div className="w-1/2 flex items-center justify-center flex-col jobseeker-item">
        <svg width="80%" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          {/* Simple jobseeker illustration */}
          <rect x="50" y="150" width="300" height="120" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" rx="10"/>
          <circle cx="200" cy="80" r="30" fill="#5D5FEF"/>
          <rect x="180" y="110" width="40" height="60" fill="#BC8EB5"/>
          <rect x="170" y="170" width="60" height="8" fill="#333" rx="4"/>
          <rect x="170" y="185" width="45" height="6" fill="#666" rx="3"/>
          <rect x="170" y="195" width="55" height="6" fill="#666" rx="3"/>
          <text x="200" y="250" textAnchor="middle" fill="#333" fontSize="14" fontWeight="bold">Job Interview</text>
        </svg>
      </div>
      <div className="w-1/2 flex items-center justify-center flex-col jobseeker-item">
        <div>
          <h1 className="text-4xl font-bold mb-6">Norsec JobSeeker</h1>
          <p className="text-lg leading-relaxed">
            Norsec jobseeker is a project where experienced members from the norsec community assist jobseekers with enhancing their interview skillset in order to nail a job within security. Usually, there are held simulated mock interview to help the jobseeker to excel in real interview and land a job within security. The offer is free of charge and is driven by experienced voluntaries from the community.
          </p>
        </div>
      </div>
    </section>
  );
}