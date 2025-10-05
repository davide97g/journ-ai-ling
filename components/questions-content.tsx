"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Item } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { fetchUserQuestions } from "@/lib/journal-questions";
import {
  ArrowDown,
  ArrowUp,
  Edit,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Question {
  id: string;
  question: string;
  order: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export function QuestionsContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [editQuestion, setEditQuestion] = useState("");

  // Fetch questions on component mount
  useEffect(() => {
    setLoading(true);
    const fetchQuestions = async () => {
      const customQuestions = await fetchUserQuestions();
      setQuestions(customQuestions);
      setLoading(false);
    };
    fetchQuestions();
  }, []);

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/journal/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: newQuestion.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions([...questions, data.question]);
        setNewQuestion("");
      }
    } catch (error) {
      console.error("Error adding question:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion || !editQuestion.trim()) return;

    try {
      const response = await fetch(
        `/api/journal/questions/${editingQuestion.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: editQuestion.trim() }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQuestions(
          questions.map((q) =>
            q.id === editingQuestion.id ? data.question : q
          )
        );
        setEditingQuestion(null);
        setEditQuestion("");
      }
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/journal/questions/${questionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setQuestions(questions.filter((q) => q.id !== questionId));
      }
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[index - 1]] = [
      newQuestions[index - 1],
      newQuestions[index],
    ];

    // Update order values
    const updatedQuestions = newQuestions.map((q, i) => ({
      ...q,
      order: i + 1,
    }));

    try {
      const response = await fetch("/api/journal/questions/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questions: updatedQuestions }),
      });

      if (response.ok) {
        setQuestions(updatedQuestions);
      }
    } catch (error) {
      console.error("Error reordering questions:", error);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === questions.length - 1) return;

    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[index + 1]] = [
      newQuestions[index + 1],
      newQuestions[index],
    ];

    // Update order values
    const updatedQuestions = newQuestions.map((q, i) => ({
      ...q,
      order: i + 1,
    }));

    try {
      const response = await fetch("/api/journal/questions/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questions: updatedQuestions }),
      });

      if (response.ok) {
        setQuestions(updatedQuestions);
      }
    } catch (error) {
      console.error("Error reordering questions:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Journal Settings</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Journal Settings</h1>
          <p className="text-muted-foreground">
            Customize your daily journal questions
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
              <DialogDescription>
                Add a new question to your daily journal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter your question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleAddQuestion}
                disabled={!newQuestion.trim() || isAdding}
              >
                {isAdding && <Spinner className="h-4 w-4 mr-2" />}
                Add Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {questions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No questions yet. Add your first question to get started.
          </div>
        ) : (
          questions.map((question, index) => (
            <Item key={question.id} className="p-4" variant="outline">
              <div
                className="flex items-center justify-between gap-3 w-full"
                draggable
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <div className="flex-1">
                  <p className="font-medium">{question.question}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="h-8 w-8"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === questions.length - 1}
                    className="h-8 w-8"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingQuestion(question);
                      setEditQuestion(question.question);
                    }}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Question</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this question? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Item>
          ))
        )}
      </div>

      {/* Edit Question Dialog */}
      <Dialog
        open={!!editingQuestion}
        onOpenChange={() => setEditingQuestion(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>Update your journal question.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your question..."
              value={editQuestion}
              onChange={(e) => setEditQuestion(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleEditQuestion}
              disabled={!editQuestion.trim()}
            >
              Update Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
