import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ShowMoreLess = ({ text, maxLength = 200 }) => {
  const [showAll, setShowAll] = useState(false);

  if (!text) return null;

  const isLong = text.length > maxLength;
  const displayText = !isLong || showAll ? text : text.slice(0, maxLength) + '...';

  return (
    <div className="relative">
      <p className="text-gray-700 leading-relaxed">
        {displayText}
      </p>
      {isLong && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="inline-flex items-center mt-2 text-sm font-medium text-[#1A2238] hover:text-[#9E1946] transition-colors"
        >
          {showAll ? (
            <>
              Вернуть
              <ChevronUp className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              Показать больше
              <ChevronDown className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ShowMoreLess;
