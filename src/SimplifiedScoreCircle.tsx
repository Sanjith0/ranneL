import React from 'react';

const SimplifiedScoreCircle = ({ totalScore }: { totalScore: number }) => {
  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 600) return '#22c55e'; // green
    if (score >= 400) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  // Get label based on score
  const getAreaLabel = (score: number) => {
    if (score >= 600) return 'Valuable area';
    if (score >= 400) return 'Developing area';
    return 'Undeveloped area';
  };

  // Calculate circle gradient angles based on score distribution
  const calculateGradient = (score: number) => {
    const maxScore = 800; // Maximum possible score
    const percentage = (score / maxScore) * 360; // Convert to degrees
    return `conic-gradient(
      ${getScoreColor(score)} ${percentage}deg,
      #e5e7eb ${percentage}deg
    )`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col items-center">
        {/* Circle with score */}
        <div className="relative w-48 h-48 mb-4">
          {/* Background gradient circle */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{ 
              background: calculateGradient(totalScore),
            }}
          />
          
          {/* Score display */}
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <span 
              className="text-5xl font-bold"
              style={{ color: getScoreColor(totalScore) }}
            >
              {totalScore.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Area label */}
        <div 
          className="text-2xl font-bold px-4 py-2 rounded-lg transition-colors duration-300"
          style={{ 
            color: getScoreColor(totalScore),
            backgroundColor: `${getScoreColor(totalScore)}15`,
          }}
        >
          {getAreaLabel(totalScore)}
        </div>
      </div>
    </div>
  );
};

export default SimplifiedScoreCircle;