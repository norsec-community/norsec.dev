export default function HeroSection() {
  const handleJoinDiscord = () => {
    window.open("https://discord.gg/4G8sEeE", "_blank");
  };

  return (
    <section className="bg-norsec-dark text-white relative overflow-hidden main-section" style={{ paddingBottom: '10vh' }}>
      <div className="max-w-screen-xl mx-auto flex flex-row justify-between items-center hero-flex" style={{ marginTop: '13vh', marginBottom: '13vh' }}>
        <div className="w-full flex items-center justify-center flex-col hero-section">
          <div className="hero-content" style={{ maxWidth: '25vw' }}>
            <h1 className="text-4xl font-bold mb-6 hero-title">
              Norsec - A norwegian driven Cybersecurity <span className="text-norsec-accent">Community</span> plattform
            </h1>
            <p className="mb-6">
              Norsec is a meeting plattform for cyber security entuisats, everyone is welomce to join, regardless if you are a student , work in the industry, or if you are just curious about cyber security. Join use today, and hang out on discord
            </p>
            <a 
              href="https://discord.gg/4G8sEeE" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-3 bg-norsec-primary text-white rounded font-bold no-underline shadow-md hover:bg-norsec-secondary transition-colors"
              style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
            >
              JOIN THE COMMUNITY
            </a>
          </div>
        </div>
        <div className="w-full flex items-center justify-center flex-col">
          <iframe 
            src="https://discord.com/widget?id=690197623491395624&theme=dark" 
            title="Discord Widget"
            className="border-0 discord-iframe"
            style={{ height: '50vh', width: '34vh' }}
          />
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
