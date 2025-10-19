import React from 'react';

const ImageBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/question.jpg')`,
          backgroundAttachment: 'fixed'
        }}
      />
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
    </div>
  );
};

export default ImageBackground;
