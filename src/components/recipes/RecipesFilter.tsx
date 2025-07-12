import React from 'react';

interface RecipesFilterProps {
  searchQuery: string;
  selectedTag: string;
  allTags: string[];
  onSearchQueryChange: (query: string) => void;
  onSelectedTagChange: (tag: string) => void;
}

// レシピページの検索・フィルター部分（検索入力・タグフィルター）
export const RecipesFilter: React.FC<RecipesFilterProps> = ({
  searchQuery,
  selectedTag,
  allTags,
  onSearchQueryChange,
  onSelectedTagChange,
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="検索..."
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <button className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">絞込</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">🏷️ タグ:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => onSelectedTagChange(tag)}
              className={`text-xs px-2 py-1 rounded ${
                selectedTag === tag 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};