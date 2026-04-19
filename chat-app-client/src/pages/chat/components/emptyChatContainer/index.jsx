import { animationDefaultOption } from "@/utils/utils";
import Lottie from "react-lottie";
import connectifyLogo from "../../../../assets/Connectify-Logo.png"; // Import the logo

function EmptyChatContainer() {
  return (
    <div className='flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center hidden duration-1000 transition-all'>
      <img src={connectifyLogo} alt="Connectify Logo" className="w-62 h-62" />

      
    

      <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center">
        <h1 className="text-3xl font-bold poppins-medium">
          Hi, Welcome to <span className="text-purple-500">Connectify</span>
        </h1>
      </div>
    </div>
  );
}

export default EmptyChatContainer;
