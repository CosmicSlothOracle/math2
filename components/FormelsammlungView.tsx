/**
 * FormelsammlungView - Komponente für die Formelsammlung mit Skin-System
 */

import React, { useState } from 'react';
import { FORMELSAMMLUNG_CONTENT, FormelsammlungContent } from '../services/formelsammlungContent';

export type FormelsammlungSkin = 'base' | 'neon' | 'klassik' | 'minimal' | 'interaktiv';

interface FormelsammlungViewProps {
  skin?: FormelsammlungSkin;
  onClose?: () => void;
}

/**
 * FormelsammlungView - Hauptkomponente
 */
export const FormelsammlungView: React.FC<FormelsammlungViewProps> = ({ skin = 'base', onClose }) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const selectedContent = selectedTopic
    ? FORMELSAMMLUNG_CONTENT.find(c => c.id === selectedTopic)
    : null;

  const getSkinStyles = () => {
    switch (skin) {
      case 'neon':
        return {
          container: 'bg-black text-green-400 border-green-500',
          section: 'bg-gray-900 border-green-500',
          formula: 'text-green-300 font-mono',
          title: 'text-green-400 font-bold',
          example: 'text-green-200 italic',
        };
      case 'klassik':
        return {
          container: 'bg-amber-50 text-gray-800 border-amber-200',
          section: 'bg-white border-amber-300 shadow-md',
          formula: 'text-gray-700 font-serif',
          title: 'text-amber-800 font-bold text-xl',
          example: 'text-gray-600 italic',
        };
      case 'minimal':
        return {
          container: 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700',
          section: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
          formula: 'text-gray-800 dark:text-gray-200 font-mono',
          title: 'text-gray-900 dark:text-gray-100 font-semibold',
          example: 'text-gray-600 dark:text-gray-400 italic',
        };
      case 'interaktiv':
        return {
          container: 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 border-blue-300',
          section: 'bg-white border-blue-400 shadow-lg hover:shadow-xl transition-shadow',
          formula: 'text-blue-700 font-mono',
          title: 'text-purple-700 font-bold',
          example: 'text-blue-600 italic',
        };
      default: // base
        return {
          container: 'bg-white text-gray-800 border-gray-300',
          section: 'bg-gray-50 border-gray-300',
          formula: 'text-gray-700 font-mono',
          title: 'text-gray-900 font-bold',
          example: 'text-gray-600 italic',
        };
    }
  };

  const styles = getSkinStyles();

  const renderFormula = (formula: { name: string; formula: string; example?: string; explanation?: string }) => {
    const formatFormula = (formula: string) => {
      // Einfache Formatierung: ^ wird zu hochgestellt, _ zu tiefgestellt
      return formula
        .replace(/\^(\d+)/g, '<sup>$1</sup>')
        .replace(/_(\d+)/g, '<sub>$1</sub>')
        .replace(/\^\(([^)]+)\)/g, '<sup>$1</sup>')
        .replace(/_\(([^)]+)\)/g, '<sub>$1</sub>');
    };

    return (
      <div key={formula.name} className={`p-4 mb-3 rounded-lg border ${styles.section}`}>
        <div className={`${styles.title} mb-2`}>{formula.name}</div>
        <div className={`${styles.formula} text-lg mb-2`} dangerouslySetInnerHTML={{ __html: formatFormula(formula.formula) }} />
        {formula.example && (
          <div className={`${styles.example} text-sm mb-1`}>
            <strong>Beispiel:</strong> {formula.example}
          </div>
        )}
        {formula.explanation && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {formula.explanation}
          </div>
        )}
      </div>
    );
  };

  if (selectedContent) {
    return (
      <div className={`p-6 rounded-lg border-2 ${styles.container} max-h-[80vh] overflow-y-auto`}>
        {onClose && (
          <button
            onClick={onClose}
            className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ← Zurück
          </button>
        )}
        <button
          onClick={() => setSelectedTopic(null)}
          className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          ← Zurück zur Übersicht
        </button>
        <h2 className={`${styles.title} text-2xl mb-6`}>{selectedContent.title}</h2>
        {selectedContent.sections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className={`${styles.title} text-xl mb-4`}>{section.title}</h3>
            {section.formulas.map(renderFormula)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border-2 ${styles.container}`}>
      {onClose && (
        <button
          onClick={onClose}
          className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          ✕ Schließen
        </button>
      )}
      <h2 className={`${styles.title} text-2xl mb-6`}>Formelsammlung</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FORMELSAMMLUNG_CONTENT.map((content) => (
          <button
            key={content.id}
            onClick={() => setSelectedTopic(content.id)}
            className={`p-6 rounded-lg border-2 ${styles.section} text-left hover:scale-105 transition-transform cursor-pointer`}
          >
            <h3 className={`${styles.title} text-xl mb-2`}>{content.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {content.sections.length} Sektionen, {content.sections.reduce((sum, s) => sum + s.formulas.length, 0)} Formeln
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

