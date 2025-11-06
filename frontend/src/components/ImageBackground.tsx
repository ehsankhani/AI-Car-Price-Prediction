import React from 'react';
// Static background only for predict page

const ImageBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0">
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
    </div>
  );
};

export default ImageBackground;
