import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
interface ComponentLoadingProps {
    duration?: number;
    onLoadingComplete?: () => void;
}
const Loading: React.FC<ComponentLoadingProps> = ({ duration = 2000, onLoadingComplete }) => {
    const [loadingMessage, setLoadingMessage] = useState('Initializing component library');
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const loadingMessages = [
        'Initializing component library',
        'Fetching component templates',
        'Optimizing render functions',
        'Building component tree',
        'Loading style definitions',
        'Applying theme variables',
        'Preparing interactive elements',
        'Checking component dependencies',
        'Configuring layout system'
    ];
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const increment = Math.max(0.5, (100 - prev) / 15);
                const newProgress = Math.min(99, prev + increment);
                return newProgress;
            });
        }, 200);
        const messageInterval = setInterval(() => {
            setLoadingMessage(prevMessage => {
                const currentIndex = loadingMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2200);
        const timeout = setTimeout(() => {
            clearInterval(interval);
            setProgress(100);
            setIsComplete(true);
            if (onLoadingComplete) {
                onLoadingComplete();
            }
        }, duration);
        return () => {
            clearInterval(interval);
            clearInterval(messageInterval);
            clearTimeout(timeout);
        };
    }, [duration, onLoadingComplete]);
    const blobVariants = {
        initial: {
            borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%',
            scale: 1,
        },
        animate: {
            borderRadius: ['60% 40% 30% 70%/60% 30% 70% 40%',
                '30% 60% 70% 40%/50% 60% 30% 60%',
                '40% 60% 30% 70%/70% 40% 60% 30%',
                '60% 40% 30% 70%/60% 30% 70% 40%'],
            scale: [1, 1.05, 0.95, 1],
            transition: {
                duration: 8,
                repeat: Infinity,
                repeatType: 'loop' as const,
            }
        },
    };
    return (<div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center">
      <div className="text-center px-4 w-full max-w-md">
        
        <div className="relative w-32 h-32 mx-auto mb-10">
          
          <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 opacity-30 blur-lg" variants={blobVariants} initial="initial" animate="animate"/>
          
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center z-10">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
              </svg>
            </div>
          </div>
        </div>

        
        <motion.div className="h-8 mb-8" key={loadingMessage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
          <h2 className="text-xl font-medium text-gray-800">
            {isComplete ? 'Components Ready' : loadingMessage}
          </h2>
        </motion.div>
        
        
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{
            ease: "easeOut",
        }}/>
        </div>
        
        
        <p className="mt-2 text-sm text-gray-500 font-medium">
          {Math.round(progress)}%
        </p>
        
        
        <motion.div className="mt-8 text-sm text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-center space-x-2 flex-wrap">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-700">Framework</span>
            
            <span className="mx-2">•</span>
            
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-700">Styles</span>
            
            <span className="mx-2">•</span>
            
            {progress < 50 ? (<>
                <span className="inline-block w-2 h-2 bg-blue-500 animate-pulse rounded-full"></span>
                <span className="text-gray-700">Components</span>
              </>) : progress < 85 ? (<>
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Components</span>
                <span className="mx-2">•</span>
                <span className="inline-block w-2 h-2 bg-blue-500 animate-pulse rounded-full"></span>
                <span className="text-gray-700">Rendering</span>
              </>) : (<>
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Components</span>
                <span className="mx-2">•</span>
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Rendering</span>
              </>)}
          </div>
        </motion.div>
        
        
        {isComplete && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <p className="text-green-600 font-medium">All components loaded successfully!</p>
          </motion.div>)}
      </div>
    </div>);
};
export default Loading;
