import React, { useState } from 'react';
import { Folder, FolderOpen, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import '../styles/cards.css';

export default function FolderTree({ structure }) {
  const [expanded, setExpanded] = useState({});

  const toggleFolder = (path) => {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderTree = (items, depth = 0) => {
    if (!items || items.length === 0) return null;

    return (
      <ul className="folder-list" style={{ marginLeft: `${depth * 16}px` }}>
        {items.map(item => (
          <li key={item.path} className="folder-item">
            {item.type === 'dir' ? (
              <>
                <span
                  className="folder-toggle"
                  onClick={() => toggleFolder(item.path)}
                >
                  {expanded[item.path] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {expanded[item.path] ? <FolderOpen size={16} /> : <Folder size={16} />}
                  {item.name}
                </span>
                {expanded[item.path] && renderTree(item.children, depth + 1)}
              </>
            ) : (
              <span className="file-item">
                <FileText size={16} style={{ opacity: 0.8 }} />
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="folder-tree">
      <h4>
        <Folder size={18} />
        Project Structure
      </h4>
      {renderTree(structure)}
    </div>
  );
}
