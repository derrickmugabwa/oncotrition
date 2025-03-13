'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { ListChecks, Save, Plus, Trash2, MoveUp, MoveDown, Edit, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SurveyQuestion {
  id: string;
  question: string;
  order_index: number;
}

interface SurveyContent {
  id: string;
  title: string;
  description: string;
}

export default function NutritionSurveyTab() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [content, setContent] = useState<SurveyContent>({
    id: '',
    title: '',
    description: ''
  });
  const [newQuestion, setNewQuestion] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState('');

  useEffect(() => {
    fetchContent();
    fetchQuestions();
  }, []);

  const fetchContent = async () => {
    try {
      const { data: surveyContent, error } = await supabase
        .from('nutrition_survey_content')
        .select('*')
        .single();

      if (error) throw error;

      if (surveyContent) {
        setContent(surveyContent);
      }
    } catch (error) {
      console.error('Error fetching survey content:', error);
      toast.error('Failed to load survey content');
    }
  };

  const updateContent = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('nutrition_survey_content')
        .upsert({
          id: content.id,
          title: content.title,
          description: content.description
        });

      if (error) throw error;

      toast.success('Content updated successfully');
    } catch (error) {
      console.error('Error updating survey content:', error);
      toast.error('Failed to update content');
    } finally {
      setSaving(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data: surveyQuestions, error } = await supabase
        .from('nutrition_survey')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      setQuestions(surveyQuestions || []);
    } catch (error) {
      console.error('Error fetching survey questions:', error);
      toast.error('Failed to load survey questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setSaving(true);
    try {
      const maxOrder = Math.max(...questions.map(q => q.order_index), 0);
      const { data: newQuestionData, error } = await supabase
        .from('nutrition_survey')
        .insert([{
          question: newQuestion.trim(),
          order_index: maxOrder + 1
        }])
        .select()
        .single();

      if (error) throw error;

      setQuestions([...questions, newQuestionData]);
      setNewQuestion('');
      toast.success('Question added successfully');
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('nutrition_survey')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQuestions(questions.filter(q => q.id !== id));
      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleEditQuestion = async (id: string) => {
    if (!editingQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }

    try {
      const { error } = await supabase
        .from('nutrition_survey')
        .update({ question: editingQuestion.trim() })
        .eq('id', id);

      if (error) throw error;

      setQuestions(questions.map(q => 
        q.id === id ? { ...q, question: editingQuestion.trim() } : q
      ));
      setEditingQuestionId(null);
      setEditingQuestion('');
      toast.success('Question updated successfully');
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
    }
  };

  const handleMoveQuestion = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === questions.length - 1)
    ) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newQuestions = [...questions];
    const temp = newQuestions[currentIndex];
    newQuestions[currentIndex] = newQuestions[newIndex];
    newQuestions[newIndex] = temp;

    try {
      const updates = [
        {
          id: newQuestions[currentIndex].id,
          order_index: currentIndex + 1
        },
        {
          id: newQuestions[newIndex].id,
          order_index: newIndex + 1
        }
      ];

      const { error } = await supabase
        .from('nutrition_survey')
        .upsert(updates);

      if (error) throw error;

      setQuestions(newQuestions);
      toast.success('Question order updated');
    } catch (error) {
      console.error('Error updating question order:', error);
      toast.error('Failed to update question order');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Content Management */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Section Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={content.description}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={updateContent}
            disabled={saving}
            className={cn(
              "flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
              saving && "opacity-50 cursor-not-allowed"
            )}
          >
            <Save className="w-4 h-4" />
            Save Content
          </button>
        </div>
      </div>

      {/* Add New Question Form */}
      <form onSubmit={handleAddQuestion} className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex gap-4">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Enter a new survey question"
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={saving}
          />
          <button
            type="submit"
            disabled={saving}
            className={cn(
              "flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
              saving && "opacity-50 cursor-not-allowed"
            )}
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </form>

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 space-y-4">
          {questions.length === 0 ? (
            <p className="text-center text-gray-500">No questions added yet</p>
          ) : (
            questions.map((question, index) => (
              <div
                key={question.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <ListChecks className="w-5 h-5 text-purple-500 flex-shrink-0" />
                {editingQuestionId === question.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editingQuestion}
                      onChange={(e) => setEditingQuestion(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleEditQuestion(question.id)}
                      className="p-2 text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingQuestionId(null);
                        setEditingQuestion('');
                      }}
                      className="p-2 text-gray-500 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="flex-1 text-gray-800">{question.question}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingQuestionId(question.id);
                          setEditingQuestion(question.question);
                        }}
                        className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveQuestion(question.id, 'up')}
                        disabled={index === 0}
                        className={cn(
                          "p-1 text-gray-500 hover:text-purple-600 transition-colors",
                          index === 0 && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveQuestion(question.id, 'down')}
                        disabled={index === questions.length - 1}
                        className={cn(
                          "p-1 text-gray-500 hover:text-purple-600 transition-colors",
                          index === questions.length - 1 && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-1 text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
