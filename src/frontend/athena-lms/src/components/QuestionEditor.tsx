import React, { useState, useEffect } from 'react';
import type { Question, MultipleChoiceQuestion, TrueFalseQuestion } from '../services/api';

interface QuestionEditorProps {
    question: Question;
    onUpdate: (updatedQuestion: Question) => void;
    onDelete: (id: number) => void;
    onSave: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onUpdate, onDelete, onSave }) => {
    const [localQuestion, setLocalQuestion] = useState<Question>(question);

    useEffect(() => {
        setLocalQuestion(question);
    }, [question]);

    const handleChange = (field: string, value: any) => {
        const updated = { ...localQuestion, [field]: value } as Question;
        setLocalQuestion(updated);
        onUpdate(updated);
    };

    const handleOptionChange = (index: number, value: string) => {
        if (localQuestion.questionType === 'MULTIPLE_CHOICE') {
            const mcQuestion = localQuestion as MultipleChoiceQuestion;
            const newOptions = [...mcQuestion.options];
            newOptions[index] = { ...newOptions[index], optionText: value };
            const updated = { ...mcQuestion, options: newOptions };
            setLocalQuestion(updated);
            onUpdate(updated);
        }
    };

    const addOption = () => {
        if (localQuestion.questionType === 'MULTIPLE_CHOICE') {
            const mcQuestion = localQuestion as MultipleChoiceQuestion;
            const updated = { ...mcQuestion, options: [...mcQuestion.options, { optionText: '', tempId: -Date.now() }] };
            setLocalQuestion(updated);
            onUpdate(updated);
        }
    };

    const removeOption = (index: number) => {
        if (localQuestion.questionType === 'MULTIPLE_CHOICE') {
            const mcQuestion = localQuestion as MultipleChoiceQuestion;
            const newOptions = mcQuestion.options.filter((_, i) => i !== index);
            const updated = { ...mcQuestion, options: newOptions };
            setLocalQuestion(updated);
            onUpdate(updated);
        }
    };

    return (
        <div className="card mb-4" style={{ position: 'relative' }}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4 items-center">
                    <h3 style={{ margin: 0 }}>Question {localQuestion.questionNumber}</h3>
                    <select
                        value={localQuestion.questionType}
                        onChange={(e) => handleChange('questionType', e.target.value)}
                        style={{ padding: '0.25rem', borderRadius: '4px' }}
                    >
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        <option value="TRUE_FALSE">True / False</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onSave()}
                        className="btn"
                        style={{ color: 'var(--success-color)', padding: '0.5rem' }}
                        title="Save Question"
                    >
                        ✓
                    </button>
                    <button
                        onClick={() => onDelete(localQuestion.id)}
                        className="btn"
                        style={{ color: 'var(--error-color)', padding: '0.5rem' }}
                        title="Delete Question"
                    >
                        🗑
                    </button>
                </div>
            </div>

            <div className="input-group">
                <label>Question Text</label>
                <textarea
                    value={localQuestion.questionText}
                    onChange={(e) => handleChange('questionText', e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
            </div>

            <div className="flex gap-4">
                <div className="input-group" style={{ flex: 1 }}>
                    <label>Points</label>
                    <input
                        type="number"
                        value={localQuestion.fullPoints}
                        onChange={(e) => handleChange('fullPoints', Number(e.target.value))}
                    />
                </div>
            </div>

            {localQuestion.questionType === 'MULTIPLE_CHOICE' && (
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Options</label>
                    {(localQuestion as MultipleChoiceQuestion).options?.map((option, index) => (
                        <div key={option.id || option.tempId || index} className="flex gap-2 mb-2 items-center">
                            <input
                                type="radio"
                                name={`correct-${localQuestion.id}`}
                                checked={(localQuestion as MultipleChoiceQuestion).correctAnswer === option.optionText}
                                onChange={() => handleChange('correctAnswer', option.optionText)}
                            />
                            <input
                                type="text"
                                value={option.optionText || ''}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            />
                            <button onClick={() => removeOption(index)} style={{ color: 'var(--error-color)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                        </div>
                    ))}
                    <button onClick={addOption} className="btn" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>+ Add Option</button>
                </div>
            )}

            {localQuestion.questionType === 'TRUE_FALSE' && (
                <div className="input-group">
                    <label>Correct Answer</label>
                    <select
                        value={(localQuestion as TrueFalseQuestion).trueFalseAnswer}
                        onChange={(e) => handleChange('trueFalseAnswer', e.target.value)}
                    >
                        <option value="">Select Answer</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default QuestionEditor;
