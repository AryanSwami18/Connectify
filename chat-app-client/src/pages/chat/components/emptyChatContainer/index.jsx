import connectifyLogo from "../../../../assets/Connectify-Logo.png"; // Import the logo

function EmptyChatContainer() {
  return (
    <div className='hidden flex-1 flex-col items-center justify-center bg-[#1c1d25] px-6 text-center md:flex'>
      <img src={connectifyLogo} alt="Connectify Logo" className="w-full max-w-xs" />
      <div className="mt-10 flex flex-col items-center gap-5 text-3xl text-white text-opacity-80 transition-all duration-300 lg:text-4xl">
        <h1 className="text-3xl font-bold poppins-medium">
          Hi, Welcome to <span className="text-purple-500">Connectify</span>
        </h1>
        <p className='max-w-md text-base text-neutral-400'>
          Pick a conversation from the sidebar or start a new one to begin chatting.
        </p>
      </div>
    </div>
  );
}

export default EmptyChatContainer;
