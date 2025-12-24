import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { Task } from '../types';

interface DragDropTaskProps {
  task: Task;
  classification: Record<string, string>;
  onClassificationChange: (classification: Record<string, string>) => void;
  disabled?: boolean;
  feedback?: Record<string, 'correct' | 'incorrect' | null>;
  correctAnswerMap?: Record<string, string>;
}

// Farb- und Icon-Mapping für Kategorien
const categoryConfig: Record<string, { color: string; bgColor: string; borderColor: string; icon: string }> = {
  quadrat: { color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-400', icon: '⬜' },
  rechteck: { color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-400', icon: '▭' },
  raute: { color: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-400', icon: '◆' },
  parallelogramm: { color: 'text-purple-700', bgColor: 'bg-purple-100', borderColor: 'border-purple-400', icon: '▱' },
  viereck: { color: 'text-slate-700', bgColor: 'bg-slate-100', borderColor: 'border-slate-400', icon: '▢' },
};

// Farb-Mapping für Shapes
const shapeColors: Record<string, string> = {
  square: 'text-amber-600',
  rectangle: 'text-blue-600',
  rhombus: 'text-emerald-600',
  parallelogram: 'text-purple-600',
  trapezoid: 'text-slate-600',
};

const DraggableShape: React.FC<{
  id: string;
  path: string;
  label: string;
  shapeType?: string;
  disabled?: boolean;
  feedback?: 'correct' | 'incorrect' | null;
}> = ({ id, path, label, shapeType, disabled, feedback }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const shapeColor = shapeType ? shapeColors[shapeType] || 'text-slate-600' : 'text-slate-600';
  const borderColor = feedback === 'correct' ? 'border-emerald-400 bg-emerald-50' : feedback === 'incorrect' ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 ${borderColor} flex items-center gap-3 sm:gap-4 cursor-grab active:cursor-grabbing touch-manipulation min-h-[56px] ${
        isDragging ? 'opacity-50' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <svg viewBox="0 0 200 150" className={`w-20 h-14 sm:w-24 sm:h-16 shrink-0 ${shapeColor}`}>
        <path d={path} fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
      <span className={`text-xs sm:text-sm font-bold ${shapeColor}`}>
        {feedback === 'correct' && '✓ '}
        {feedback === 'incorrect' && '✗ '}
        {label}
      </span>
    </div>
  );
};

const DroppableCategory: React.FC<{
  id: string;
  label: string;
  accepts: string[];
  currentClassification: Record<string, string>;
  disabled?: boolean;
  feedback?: Record<string, 'correct' | 'incorrect' | null>;
  correctAnswerMap?: Record<string, string>;
}> = ({ id, label, accepts, currentClassification, disabled, feedback, correctAnswerMap }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled,
  });

  const droppedShapes = Object.entries(currentClassification)
    .filter(([_, catId]) => catId === id)
    .map(([shapeId]) => shapeId);

  const config = categoryConfig[id] || { color: 'text-slate-700', bgColor: 'bg-slate-100', borderColor: 'border-slate-400', icon: '▢' };

  return (
    <div
      ref={setNodeRef}
      className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-3 sm:border-4 min-h-[100px] sm:min-h-[120px] transition-all touch-manipulation ${
        isOver
          ? `${config.borderColor} ${config.bgColor}`
          : `${config.borderColor} bg-white`
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <h3 className={`font-black text-xs sm:text-sm mb-2 sm:mb-3 ${config.color} flex items-center gap-2`}>
        <span className="text-lg">{config.icon}</span>
        {label}
      </h3>
      <div className="space-y-1.5 sm:space-y-2">
        {droppedShapes.length === 0 ? (
          <p className="text-[10px] sm:text-xs text-slate-400 italic">Ziehe hierher</p>
        ) : (
          droppedShapes.map((shapeId) => {
            const shape = accepts.find((s) => s === shapeId);
            const isCorrect = feedback?.[shapeId] === 'correct' || (correctAnswerMap && correctAnswerMap[shapeId] === id);
            const isIncorrect = feedback?.[shapeId] === 'incorrect';
            return shape ? (
              <div
                key={shapeId}
                className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded min-h-[32px] flex items-center ${
                  isCorrect
                    ? 'text-emerald-700 bg-emerald-100'
                    : isIncorrect
                    ? 'text-red-700 bg-red-100'
                    : `${config.color} ${config.bgColor}`
                }`}
              >
                {isCorrect ? '✓' : isIncorrect ? '✗' : '•'} {shapeId}
              </div>
            ) : null;
          })
        )}
      </div>
    </div>
  );
};

export const DragDropTask: React.FC<DragDropTaskProps> = ({
  task,
  classification,
  onClassificationChange,
  disabled = false,
  feedback,
  correctAnswerMap,
}) => {
  if (!task.dragDropData) return null;

  const [interactionMode, setInteractionMode] = useState<'dropdown' | 'drag'>('dropdown');
  const updateClassification = (shapeId: string, categoryId: string | null) => {
    if (categoryId === null) {
      const next = { ...classification };
      delete next[shapeId];
      onClassificationChange(next);
      return;
    }
    onClassificationChange({
      ...classification,
      [shapeId]: categoryId,
    });
  };
  const handleSelectChange = (shapeId: string, categoryId: string) => {
    if (disabled) return;
    if (!categoryId) {
      updateClassification(shapeId, null);
      return;
    }
    const category = task.dragDropData!.categories.find((cat) => cat.id === categoryId);
    if (!category || !category.accepts.includes(shapeId)) {
      return;
    }
    updateClassification(shapeId, categoryId);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || disabled) return;

    const shapeId = active.id as string;
    const categoryId = over.id as string;

    // Check if category accepts this shape
    const category = task.dragDropData!.categories.find((cat) => cat.id === categoryId);
    if (category && category.accepts.includes(shapeId)) {
      updateClassification(shapeId, categoryId);
    }
  };

  // Mobile fallback: tap shape then tap category
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  useEffect(() => {
    if (interactionMode !== 'drag' && selectedShape) {
      setSelectedShape(null);
    }
  }, [interactionMode, selectedShape]);

  const handleShapeClick = (shapeId: string) => {
    if (disabled || interactionMode !== 'drag') return;
    if (selectedShape === shapeId) {
      setSelectedShape(null);
    } else {
      setSelectedShape(shapeId);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (disabled || !selectedShape || interactionMode !== 'drag') return;

    const category = task.dragDropData!.categories.find((cat) => cat.id === categoryId);
    if (category && category.accepts.includes(selectedShape)) {
      updateClassification(selectedShape, categoryId);
      setSelectedShape(null);
    }
  };

  const dragInterface = (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-black text-slate-400 uppercase">Figuren:</p>
          {task.dragDropData.shapes.map((shape) => (
            <div
              key={shape.id}
              onClick={() => handleShapeClick(shape.id)}
              className={selectedShape === shape.id ? 'ring-2 ring-indigo-500 rounded-lg' : ''}
            >
              <DraggableShape
                id={shape.id}
                path={shape.path}
                label={shape.label}
                shapeType={shape.shapeType}
                disabled={disabled}
                feedback={feedback?.[shape.id]}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <p className="text-xs font-black text-slate-400 uppercase col-span-full">Kategorien:</p>
          {task.dragDropData.categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={selectedShape ? 'cursor-pointer' : ''}
            >
              <DroppableCategory
                id={category.id}
                label={category.label}
                accepts={category.accepts}
                currentClassification={classification}
                disabled={disabled}
                feedback={feedback}
                correctAnswerMap={correctAnswerMap}
              />
            </div>
          ))}
        </div>
        {selectedShape && (
          <div className="mt-4 p-3 bg-indigo-100 rounded-lg text-xs font-bold text-indigo-700 text-center">
            Wähle eine Kategorie für: {task.dragDropData!.shapes.find((s) => s.id === selectedShape)?.label}
          </div>
        )}
      </div>
    </DndContext>
  );

  const getFeedbackMessage = (shapeId: string, selectedCategoryId: string | null): string | null => {
    if (!feedback || !correctAnswerMap) return null;
    const correctCategoryId = correctAnswerMap[shapeId];
    if (!selectedCategoryId) return null;

    if (feedback[shapeId] === 'incorrect') {
      const shape = task.dragDropData!.shapes.find(s => s.id === shapeId);
      const selectedCategory = task.dragDropData!.categories.find(c => c.id === selectedCategoryId);
      const correctCategory = task.dragDropData!.categories.find(c => c.id === correctCategoryId);

      if (shape?.shapeType === 'square') {
        return 'Ein Quadrat ist zugleich ein Rechteck und eine Raute. Also musst du es als Quadrat klassifizieren.';
      }
      if (shape?.shapeType === 'rectangle' && selectedCategoryId === 'quadrat') {
        return 'Ein Rechteck ist kein Quadrat. Ein Quadrat hat alle Seiten gleich lang, ein Rechteck nicht.';
      }
      if (shape?.shapeType === 'rhombus' && selectedCategoryId === 'quadrat') {
        return 'Eine Raute ist kein Quadrat. Ein Quadrat hat rechte Winkel, eine Raute nicht.';
      }
      return `Die Figur "${shape?.label}" gehört zur Kategorie "${correctCategory?.label}", nicht zu "${selectedCategory?.label}".`;
    }
    return null;
  };

  const dropdownInterface = (
    <div className="space-y-4">
      {task.dragDropData.shapes.map((shape) => {
        const shapeColor = shape.shapeType ? shapeColors[shape.shapeType] || 'text-slate-600' : 'text-slate-600';
        const selectedCategoryId = classification[shape.id];
        const feedbackMsg = getFeedbackMessage(shape.id, selectedCategoryId || null);
        const borderClass = feedback?.[shape.id] === 'correct'
          ? 'border-emerald-400 bg-emerald-50'
          : feedback?.[shape.id] === 'incorrect'
          ? 'border-red-400 bg-red-50'
          : 'border-slate-100 bg-white';

        return (
          <div key={shape.id} className={`p-4 rounded-2xl border-2 ${borderClass} shadow-sm space-y-3`}>
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 200 150" className={`w-20 h-14 shrink-0 ${shapeColor}`}>
                <path d={shape.path} fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
              <div>
                <p className={`text-sm font-black ${shapeColor} flex items-center gap-2`}>
                  {feedback?.[shape.id] === 'correct' && '✓ '}
                  {feedback?.[shape.id] === 'incorrect' && '✗ '}
                  {shape.label}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">Kategorie wählen</p>
              </div>
            </div>
            <select
              value={selectedCategoryId || ''}
              onChange={(e) => handleSelectChange(shape.id, e.target.value)}
              disabled={disabled}
              className="w-full border-2 border-slate-200 rounded-xl p-2 font-bold text-slate-700 bg-white focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="">-- Nicht zugeordnet --</option>
              {task.dragDropData.categories.map((category) => {
                const catConfig = categoryConfig[category.id];
                const acceptsShape = category.accepts.includes(shape.id);
                return (
                  <option
                    key={category.id}
                    value={category.id}
                    disabled={!acceptsShape}
                  >
                    {catConfig?.icon || ''} {category.label}
                    {!acceptsShape ? ' (nicht passend)' : ''}
                  </option>
                );
              })}
            </select>
            {feedbackMsg && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-bold text-amber-800">💡 Hinweis:</p>
                <p className="text-xs text-amber-700">{feedbackMsg}</p>
              </div>
            )}
          </div>
        );
      })}
      <div className="text-xs font-bold text-slate-500 text-center">
        {Object.keys(classification).length} / {task.dragDropData.shapes.length} Figuren zugeordnet
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      <p className="text-sm font-bold text-slate-600">
        Ordne die Figuren dem 'Haus der Vierecke' zu. Nutze den Dropdown-Modus für absolute Zuverlässigkeit
        oder wechsle zu Drag & Drop, wenn du die Bonus-UX testen möchtest.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={`px-4 py-2 rounded-full border-2 text-xs font-black uppercase tracking-widest ${
            interactionMode === 'dropdown'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-slate-600 border-slate-200'
          }`}
          onClick={() => setInteractionMode('dropdown')}
        >
          Dropdown
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-full border-2 text-xs font-black uppercase tracking-widest ${
            interactionMode === 'drag'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-slate-600 border-slate-200'
          }`}
          onClick={() => setInteractionMode('drag')}
        >
          Drag & Drop
        </button>
      </div>
      {interactionMode === 'dropdown' ? dropdownInterface : dragInterface}
    </div>
  );
};

