import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="bg-surface p-8 rounded-xl w-full max-w-md shadow-lg border border-gray-100">

        <p>СТРАНИЦА ДОМА</p>  

      </div>
    </div>
  );
}