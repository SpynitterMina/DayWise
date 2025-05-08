
'use client';

import { useState } from 'react';
import type { SpacedRepetitionTask } from '@/contexts/SpacedRepetitionContext';
import { useSpacedRepetition } from '@/contexts/SpacedRepetitionContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Edit3, Trash2, Smile, Meh, Frown, CalendarClock } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import SRTaskEditForm from './SRTaskEditForm'; // Import the edit form

interface SRTaskItemProps {
  task: SpacedRepetitionTask;
}

export default function SRTaskItem({ task }: SRTaskItemProps) {
  const { deleteTask, markAsReviewed } = useSpacedRepetition();
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const nextReviewDateObj = parseISO(task.nextReviewDate);
  const isDueToday = isToday(nextReviewDateObj);
  const isOverdue = isPast(nextReviewDateObj) && !isDueToday;

  const handleReview = (difficulty: 'easy' | 'medium' | 'hard') => {
    markAsReviewed(task.id, difficulty);
  };

  if (isEditing) {
    return <SRTaskEditForm task={task} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <Card className={`shadow-sm transition-all duration-200 ${isOverdue ? 'border-red-500 bg-red-500/5' : isDueToday ? 'border-amber-500 bg-amber-500/5' : 'bg-card'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle 
            className="text-lg font-medium cursor-pointer hover:text-primary"
            onClick={() => setShowDetails(!showDetails)}
          >
            {task.title}
          </CardTitle>
          <div className="flex items-center space-x-1">
             <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-7 w-7">
                <Edit3 size={16} />
             </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="text-destructive/70 hover:text-destructive h-7 w-7">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground flex items-center mt-1">
            <CalendarClock size={14} className="mr-1.5"/>
            Next Review: {format(nextReviewDateObj, 'PPP')}
            {isDueToday && <Badge variant="outline" className="ml-2 bg-amber-500/20 text-amber-700 border-amber-500">Due Today</Badge>}
            {isOverdue && <Badge variant="destructive" className="ml-2">Overdue</Badge>}
        </div>
        {task.lastReviewedDate && (
            <p className="text-xs text-muted-foreground">Last Reviewed: {format(parseISO(task.lastReviewedDate), 'PPP')} (Difficulty: {task.difficulty || 'N/A'})</p>
        )}
      </CardHeader>

      {showDetails && task.content && (
        <CardContent className="py-2 text-sm text-muted-foreground whitespace-pre-wrap border-t pt-3">
          {task.content}
        </CardContent>
      )}

      {(isDueToday || isOverdue) && (
        <CardFooter className="pt-3 border-t flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
          <p className="text-sm font-medium mr-0 sm:mr-auto">How well did you recall this?</p>
          <Button variant="outline" size="sm" onClick={() => handleReview('easy')} className="bg-green-500/10 hover:bg-green-500/20 text-green-700 border-green-500 w-full sm:w-auto">
            <Smile size={16} className="mr-1" /> Easy
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleReview('medium')} className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-700 border-yellow-500 w-full sm:w-auto">
            <Meh size={16} className="mr-1" /> Medium
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleReview('hard')} className="bg-red-500/10 hover:bg-red-500/20 text-red-700 border-red-500 w-full sm:w-auto">
            <Frown size={16} className="mr-1" /> Hard
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

