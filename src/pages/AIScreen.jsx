import React from 'react';
import AIComponent from '../components/ai/AIComponent';

export default function AIScreen({ route }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AIComponent />
    </div>
  );
}