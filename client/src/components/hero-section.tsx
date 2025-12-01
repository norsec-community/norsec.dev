export default function HeroSection() {
  return (
    <section className="bg-norsec-dark text-white relative overflow-hidden main-section" style={{ paddingBottom: '10vh' }}>
      <div className="max-w-screen-xl mx-auto flex flex-col justify-center items-center hero-flex" style={{ marginTop: '13vh', marginBottom: '13vh' }}>
        <div className="w-full flex items-center justify-center flex-col hero-section">
          <div className="hero-content text-center" style={{ maxWidth: '800px' }}>
            <h1 className="text-4xl font-bold mb-6 hero-title">
              Norsec - A norwegian driven Cybersecurity <span className="text-norsec-accent">Community</span> platform
            </h1>
            <p className="mb-6 text-lg">
              Norsec is a meeting platform for cyber security enthusiasts, everyone is welcome to join, regardless if you are a student, work in the industry, or if you are just curious about cyber security. Join us today, and hang out on discord
            </p>
            <a 
              href="https://discord.gg/4G8sEeE" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-norsec-primary text-white rounded font-bold no-underline shadow-md hover:bg-norsec-secondary transition-colors text-lg"
              style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
            >
              JOIN THE COMMUNITY
            </a>
          </div>
        </div>
      </div>
      
      {/* Slanted background element */}
      <div 
        className="absolute bg-norsec-light slanted-bg"
        style={{
          content: '',
          left: '-50%',
          width: '160%',
          height: '200%',
          top: '78%',
          transform: 'rotate(6deg)',
          zIndex: 1
        }}
      />
    </section>
  );
}
