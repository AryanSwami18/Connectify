import animationData from '@/assets/Loader-Eighteen.json'
export const colorCombinations = [
    'bg-blue-500 border border-blue-700 text-white',
    'bg-green-300 border border-green-500 text-gray-800',
    'bg-red-600 border border-red-800 text-yellow-100',
    'bg-purple-200 border border-purple-400 text-gray-900',
  ];

  
  export const getColor = (color) =>{
        if(color => 0 &&  color <= colorCombinations.length){
            return colorCombinations[color]
        }
            return colorCombinations[0]
  }


  export const animationDefaultOption = {
    loop:true,
    autoplay:true,
    animationData:animationData
  }